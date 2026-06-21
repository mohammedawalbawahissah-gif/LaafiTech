from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ai_services.services import generate_impact_narrative
from .models import FunderOrganization, ProcurementOrder
from .serializers import FunderOrganizationSerializer, ProcurementOrderSerializer


class IsAdminOrOwningFunder(permissions.BasePermission):
    """Admins manage all funder orgs; a funder may only view/edit their own."""

    def has_object_permission(self, request, view, obj):
        if request.user.role in ("admin", "superadmin"):
            return True
        return obj.user_id == request.user.id


class FunderOrganizationViewSet(viewsets.ModelViewSet):
    queryset = FunderOrganization.objects.all()
    serializer_class = FunderOrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwningFunder]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role in ("admin", "superadmin"):
            return qs
        return qs.filter(user=self.request.user)


class ProcurementOrderViewSet(viewsets.ModelViewSet):
    queryset = ProcurementOrder.objects.select_related("funder", "target_school").all().order_by("-created_at")
    serializer_class = ProcurementOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "funder", "target_school"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.user.role
        if role == "funder":
            return qs.filter(funder__user=self.request.user)
        if role in ("admin", "superadmin"):
            return qs
        # Any other role (e.g. agent) has no business in funder procurement
        # data -- previously this fell through to the unfiltered queryset.
        return qs.none()

    @action(detail=True, methods=["post"], url_path="generate-report")
    def generate_report(self, request, pk=None):
        """
        Trigger (or regenerate) the AI impact narrative for a completed
        order. See ai_services.services.generate_impact_narrative -- this
        is what turns raw DistributionRecord data into a funder-ready story.
        """
        order = self.get_object()
        narrative = generate_impact_narrative(order)
        order.impact_narrative = narrative
        order.save(update_fields=["impact_narrative"])
        return Response({"impact_narrative": narrative})
