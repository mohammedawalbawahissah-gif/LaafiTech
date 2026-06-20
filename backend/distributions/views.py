from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ai_services.services import flag_anomalous_distribution, hash_photo
from .models import DistributionRecord, School
from .serializers import (
    DistributionRecordSerializer,
    DistributionVerifySerializer,
    SchoolSerializer,
)


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["district", "region"]


class DistributionRecordViewSet(viewsets.ModelViewSet):
    queryset = DistributionRecord.objects.select_related("agent", "school").all().order_by("-timestamp")
    serializer_class = DistributionRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["verification_status", "agent", "school", "payment_type"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == "agent":
            return qs.filter(agent__user=self.request.user)
        return qs

    def perform_create(self, serializer):
        """
        On creation: run AI verification-assist (photo de-dup hash + anomaly
        flags) and store the results. The record still lands in 'pending' --
        AI assists the human reviewer, it never auto-verifies, because
        payouts are held until admin approval per platform policy.
        """
        record = serializer.save()
        photo_hash = hash_photo(record.photo_url)
        flags, score = flag_anomalous_distribution(record, photo_hash)
        record.photo_hash = photo_hash
        record.ai_anomaly_flags = flags
        record.ai_anomaly_score = score
        record.save(update_fields=["photo_hash", "ai_anomaly_flags", "ai_anomaly_score"])

    @action(detail=False, methods=["get"], url_path="verification-queue")
    def verification_queue(self, request):
        """
        Admin verification queue, AI-flagged records surfaced first so
        reviewers spend their attention where it matters most.
        """
        if request.user.role not in ("admin", "superadmin"):
            return Response({"detail": "Not permitted."}, status=403)
        qs = self.get_queryset().filter(
            verification_status__in=[DistributionRecord.VerificationStatus.PENDING, DistributionRecord.VerificationStatus.FLAGGED]
        ).order_by("-ai_anomaly_score", "timestamp")
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="verify")
    def verify(self, request, pk=None):
        """Admin approves or rejects a record. Approval here is what
        unlocks payout eligibility (see payments app)."""
        if request.user.role not in ("admin", "superadmin"):
            return Response({"detail": "Not permitted."}, status=403)

        record = self.get_object()
        serializer = DistributionVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        record.verification_status = serializer.validated_data["decision"]
        record.verified_by = request.user
        record.verified_at = timezone.now()
        if serializer.validated_data.get("notes"):
            record.notes = serializer.validated_data["notes"]
        record.save(update_fields=["verification_status", "verified_by", "verified_at", "notes"])

        return Response(DistributionRecordSerializer(record).data, status=status.HTTP_200_OK)
