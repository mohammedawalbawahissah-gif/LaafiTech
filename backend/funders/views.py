from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ai_services.services import generate_impact_narrative
from .models import FunderOrganization, ProcurementOrder
from .serializers import FunderOrganizationSerializer, ProcurementOrderSerializer


class FunderOrganizationViewSet(viewsets.ModelViewSet):
    queryset = FunderOrganization.objects.all()
    serializer_class = FunderOrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProcurementOrderViewSet(viewsets.ModelViewSet):
    queryset = ProcurementOrder.objects.select_related("funder", "target_school").all().order_by("-created_at")
    serializer_class = ProcurementOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "funder", "target_school"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == "funder":
            return qs.filter(funder__user=self.request.user)
        return qs

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
