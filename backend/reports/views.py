from rest_framework import permissions, viewsets

from .models import ImpactReport
from .serializers import ImpactReportSerializer


class ImpactReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImpactReport.objects.all().order_by("-generated_at")
    serializer_class = ImpactReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["scope", "scope_reference"]
