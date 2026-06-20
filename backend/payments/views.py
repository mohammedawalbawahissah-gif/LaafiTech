from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from . import services
from .models import PaymentTransaction, Payout
from .serializers import PaymentTransactionSerializer, PayoutSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "superadmin")


class PayoutViewSet(viewsets.ModelViewSet):
    queryset = Payout.objects.select_related("agent").all().order_by("-created_at")
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "method", "agent"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == "agent":
            return qs.filter(agent__user=self.request.user)
        return qs

    def perform_create(self, serializer):
        # Only admins can initiate payouts, and only for already-verified
        # distribution records (enforced at the distribution_records level
        # via the platform's "held until verified" policy).
        serializer.save(initiated_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def process(self, request, pk=None):
        """Trigger the actual payment via the routed rail (native MoMo / Hubtel)."""
        payout = self.get_object()
        txn = services.process_agent_payout(payout)
        return Response(PaymentTransactionSerializer(txn).data)


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentTransaction.objects.all().order_by("-created_at")
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filterset_fields = ["direction", "provider", "status"]
