from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Agent, AgentInventoryAllocation
from .serializers import AgentInventoryAllocationSerializer, AgentSerializer


class IsAdminOrSelf(permissions.BasePermission):
    """Agents can view/edit their own profile; admins can manage all."""

    def has_object_permission(self, request, view, obj):
        if request.user.role in ("admin", "superadmin"):
            return True
        return obj.user_id == request.user.id


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "superadmin")


class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.select_related("user").all()
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]
    filterset_fields = ["verification_status", "momo_provider", "catchment_area"]

    def get_permissions(self):
        # Agent profiles are created by self-registration (see
        # accounts.serializers.RegisterSerializer) or, going forward,
        # manually by an admin -- never directly through this endpoint.
        # Previously this had no restriction at all on create.
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated(), IsAdminOrSelf()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role in ("admin", "superadmin"):
            return qs
        return qs.filter(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def set_status(self, request, pk=None):
        """
        POST /api/agents/{id}/set_status/  {"status": "verified"|"pending"|"suspended"}
        The only path that can change verification_status -- it's read-only
        on AgentSerializer so an agent can never self-verify via a generic
        PATCH to their own profile.
        """
        agent = self.get_object()
        new_status = request.data.get("status")
        valid = [c[0] for c in Agent.VerificationStatus.choices]
        if new_status not in valid:
            return Response({"detail": f"status must be one of {valid}."}, status=400)
        agent.verification_status = new_status
        agent.save(update_fields=["verification_status"])
        return Response(AgentSerializer(agent).data)


class AgentInventoryAllocationViewSet(viewsets.ModelViewSet):
    queryset = AgentInventoryAllocation.objects.select_related("agent", "batch").all()
    serializer_class = AgentInventoryAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["agent", "restock_requested"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.user.role
        if role == "agent":
            return qs.filter(agent__user=self.request.user)
        if role in ("admin", "superadmin"):
            return qs
        # Any other role (funder, community_user) has no business seeing
        # agent inventory allocation data -- previously this fell through
        # unfiltered.
        return qs.none()
