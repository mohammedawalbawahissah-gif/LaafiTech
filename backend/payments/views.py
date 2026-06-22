from django.db import transaction
from django.utils import timezone

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

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

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "generate"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.user.role
        if role == "agent":
            return qs.filter(agent__user=self.request.user)
        if role in ("admin", "superadmin"):
            return qs
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(initiated_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def process(self, request, pk=None):
        """Trigger the actual payment via the routed rail (native MoMo / Hubtel)."""
        payout = self.get_object()
        txn = services.process_agent_payout(payout)
        return Response(PaymentTransactionSerializer(txn).data)

    @action(detail=False, methods=["post"], permission_classes=[IsAdmin], url_path="generate")
    def generate(self, request):
        """
        Scan all verified DistributionRecords that haven't been linked to a
        Payout yet, group them by agent, and create one pending Payout per
        agent covering the current calendar month.

        Idempotent: if a pending payout already exists for an agent this
        month, verified records are added to it rather than creating a
        duplicate.
        """
        from distributions.models import DistributionRecord
        from agents.models import Agent

        today = timezone.now().date()
        period_start = today.replace(day=1)
        # Last day of current month
        import calendar
        last_day = calendar.monthrange(today.year, today.month)[1]
        period_end = today.replace(day=last_day)

        # Verified distributions not yet attached to any payout
        unpaid = DistributionRecord.objects.filter(
            verification_status=DistributionRecord.VerificationStatus.VERIFIED,
            payouts__isnull=True,
        ).select_related("agent")

        if not unpaid.exists():
            return Response({"created": 0, "detail": "No unlinked verified distributions found."})

        # Group by agent
        by_agent: dict[int, list] = {}
        for record in unpaid:
            by_agent.setdefault(record.agent_id, []).append(record)

        created_count = 0
        with transaction.atomic():
            for agent_id, records in by_agent.items():
                agent = records[0].agent

                # Calculate payout amount: unit_price × quantity for each record
                amount = sum(r.unit_price * r.quantity for r in records)

                # Find or create a pending payout for this agent this month
                payout, created = Payout.objects.get_or_create(
                    agent=agent,
                    status=Payout.Status.PENDING,
                    period_start=period_start,
                    period_end=period_end,
                    defaults={
                        "amount": 0,
                        "initiated_by": request.user,
                        "method": agent.resolve_payout_method(),
                    },
                )
                if created:
                    created_count += 1

                # Add the amount and link the records
                payout.amount = (payout.amount or 0) + amount
                payout.save(update_fields=["amount"])
                payout.distribution_records.add(*[r.id for r in records])

        return Response({
            "created": created_count,
            "detail": f"{created_count} new payout record(s) created across {len(by_agent)} agent(s).",
        })


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentTransaction.objects.all().order_by("-created_at")
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filterset_fields = ["direction", "provider", "status"]


class HubtelCallbackView(APIView):
    """
    POST /api/webhooks/hubtel/ -- Hubtel posts here after a Checkout
    session completes (used by both funder procurement payments and
    community shop hubtel_checkout orders).
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.data if isinstance(request.data, dict) else {}
        data_block = payload.get("Data", {}) if isinstance(payload.get("Data"), dict) else {}

        reference = (
            payload.get("ClientReference")
            or payload.get("clientReference")
            or data_block.get("ClientReference")
            or ""
        )
        success = (
            payload.get("Status") == "Success"
            or payload.get("status") == "Success"
            or payload.get("ResponseCode") == "0000"
            or data_block.get("Status") == "Success"
        )

        if not reference:
            return Response({"detail": "No client reference in callback payload."}, status=400)

        txn = PaymentTransaction.objects.filter(provider_transaction_id=reference).order_by("-created_at").first()
        if txn is None:
            return Response({"detail": "Unknown reference."}, status=404)

        txn.status = "completed" if success else "failed"
        txn.raw_response = payload
        txn.save(update_fields=["status", "raw_response"])

        if txn.direction == PaymentTransaction.Direction.INBOUND_PROCUREMENT and txn.procurement_order_id:
            order = txn.procurement_order
            order.payment_reference = reference
            if success:
                order.status = order.Status.PAID
            order.save(update_fields=["payment_reference", "status"])

        if txn.direction == PaymentTransaction.Direction.INBOUND_SHOP_ORDER and txn.shop_order_id:
            from community.models import Order
            shop_order = txn.shop_order
            shop_order.payment_status = Order.PaymentStatus.PAID if success else Order.PaymentStatus.FAILED
            if success and shop_order.status == Order.Status.PENDING:
                shop_order.status = Order.Status.CONFIRMED
            shop_order.save(update_fields=["payment_status", "status"])

        return Response({"detail": "ok"})


class MomoCallbackView(APIView):
    """
    POST /api/webhooks/momo/
    MTN MoMo Collections posts here when the payer approves or rejects the
    USSD prompt.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.data if isinstance(request.data, dict) else {}

        reference = payload.get("externalId") or payload.get("referenceId") or ""
        success = payload.get("status") == "SUCCESSFUL"

        if not reference:
            return Response({"detail": "No externalId in callback payload."}, status=400)

        txn = PaymentTransaction.objects.filter(provider_transaction_id=reference).order_by("-created_at").first()
        if txn is None:
            return Response({"detail": "Unknown reference."}, status=404)

        txn.status = "completed" if success else "failed"
        txn.raw_response = payload
        txn.save(update_fields=["status", "raw_response"])

        if txn.direction == PaymentTransaction.Direction.INBOUND_PROCUREMENT and txn.procurement_order_id:
            order = txn.procurement_order
            order.payment_reference = reference
            if success:
                order.status = order.Status.PAID
            order.save(update_fields=["payment_reference", "status"])

        if txn.direction == PaymentTransaction.Direction.INBOUND_SHOP_ORDER and txn.shop_order_id:
            from community.models import Order
            shop_order = txn.shop_order
            shop_order.payment_status = Order.PaymentStatus.PAID if success else Order.PaymentStatus.FAILED
            if success and shop_order.status == Order.Status.PENDING:
                shop_order.status = Order.Status.CONFIRMED
            shop_order.save(update_fields=["payment_status", "status"])

        return Response({"detail": "ok"})
