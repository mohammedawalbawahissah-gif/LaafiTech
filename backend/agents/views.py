from rest_framework import permissions, viewsets

from .models import Agent, AgentInventoryAllocation
from .serializers import AgentInventoryAllocationSerializer, AgentSerializer


class IsAdminOrSelf(permissions.BasePermission):
    """Agents can view/edit their own profile; admins can manage all."""

    def has_object_permission(self, request, view, obj):
        if request.user.role in ("admin", "superadmin"):
            return True
        return obj.user_id == request.user.id


class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.select_related("user").all()
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]
    filterset_fields = ["verification_status", "momo_provider", "catchment_area"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role in ("admin", "superadmin"):
            return qs
        return qs.filter(user=self.request.user)


class AgentInventoryAllocationViewSet(viewsets.ModelViewSet):
    queryset = AgentInventoryAllocation.objects.select_related("agent", "batch").all()
    serializer_class = AgentInventoryAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["agent", "restock_requested"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == "agent":
            return qs.filter(agent__user=self.request.user)
        return qs
