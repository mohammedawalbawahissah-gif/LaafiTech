from rest_framework import permissions, viewsets

from .models import InventoryBatch
from .serializers import InventoryBatchSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ("admin", "superadmin")


class InventoryBatchViewSet(viewsets.ModelViewSet):
    queryset = InventoryBatch.objects.all().order_by("-production_date")
    serializer_class = InventoryBatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filterset_fields = ["status"]
