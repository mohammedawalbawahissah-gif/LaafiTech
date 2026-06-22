from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from payments import services as payment_services

from .models import CycleLog, Order, Product
from .serializers import CycleLogSerializer, OrderSerializer, ProductSerializer


class IsCommunityUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "community_user"


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "superadmin")


class IsAdminOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "superadmin", "agent")


class CycleLogViewSet(viewsets.ModelViewSet):
    """A community_user's own period history. Strictly own-data-only --
    there is no admin override here, since this is private health data
    with no operational reason for staff to see it."""

    serializer_class = CycleLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommunityUser]

    def get_queryset(self):
        return CycleLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def prediction(self, request):
        """
        GET /api/community/cycle-logs/prediction/
        Simple average-cycle-length prediction from the user's own logged
        history. Not a medical device -- a rough estimate only, and the
        response says so explicitly so the frontend can display that
        caveat rather than presenting it as precise.
        """
        logs = list(CycleLog.objects.filter(user=request.user).order_by("period_start"))
        if len(logs) < 2:
            return Response({
                "available": False,
                "reason": "Log at least 2 periods to get a prediction.",
            })

        starts = [log.period_start for log in logs]
        cycle_lengths = [(starts[i] - starts[i - 1]).days for i in range(1, len(starts))]
        avg_cycle_length = round(sum(cycle_lengths) / len(cycle_lengths))

        period_lengths = [
            (log.period_end - log.period_start).days + 1
            for log in logs if log.period_end
        ]
        avg_period_length = round(sum(period_lengths) / len(period_lengths)) if period_lengths else 5

        last_start = starts[-1]
        next_predicted_start = last_start + timedelta(days=avg_cycle_length)
        today = timezone.localdate()
        current_cycle_day = (today - last_start).days + 1 if today >= last_start else None

        return Response({
            "available": True,
            "average_cycle_length_days": avg_cycle_length,
            "average_period_length_days": avg_period_length,
            "last_period_start": last_start,
            "next_predicted_start": next_predicted_start,
            "current_cycle_day": current_cycle_day,
            "disclaimer": "Estimate based on your own logged history, not a medical prediction.",
        })


class ProductViewSet(viewsets.ModelViewSet):
    """Shop catalog. Anyone logged in can browse. Admins and agents can add
    new products (agents are LaafiTech's field-facing reps and often know
    what local demand looks like); only admins can edit or remove existing
    listings, since that affects what's already live for community_users."""

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsAdminOrAgent()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated()]


class OrderViewSet(viewsets.ModelViewSet):
    """A community_user's own shop orders. Admins can see/manage all
    orders (to mark them fulfilled), but never create one on a user's
    behalf -- ordering is always self-service."""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "product"]

    def get_queryset(self):
        qs = Order.objects.select_related("product").all()
        if self.request.user.role in ("admin", "superadmin"):
            return qs
        return qs.filter(user=self.request.user)

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCommunityUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        payment_method = serializer.validated_data.get("payment_method", Order.PaymentMethod.CASH_ON_DELIVERY)
        # COD never goes through an online charge, so it starts at its own
        # terminal-until-delivery status rather than the generic "pending"
        # the other two methods use while waiting on the `pay` step.
        initial_payment_status = (
            Order.PaymentStatus.COLLECT_ON_DELIVERY
            if payment_method == Order.PaymentMethod.CASH_ON_DELIVERY
            else Order.PaymentStatus.PENDING
        )
        serializer.save(
            user=self.request.user,
            total_price=product.price * quantity,
            payment_status=initial_payment_status,
        )

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        """
        POST /api/community/orders/{id}/pay/
        Step 2 of the order-then-pay flow. momo_prompt pushes a native MTN
        MoMo USSD approval prompt to the customer's phone; hubtel_checkout
        returns a checkout_url the frontend should redirect to.
        cash_on_delivery orders don't need this step at all -- calling it
        just confirms that and returns early.

        Body: {"phone": "0244..."} optional override of delivery_phone;
        {"return_url": "https://..."} where Hubtel sends the browser back
        after a hosted checkout completes.
        """
        order = self.get_object()
        if order.user_id != request.user.id and request.user.role not in ("admin", "superadmin"):
            return Response({"detail": "Not your order."}, status=403)

        if order.payment_method == Order.PaymentMethod.CASH_ON_DELIVERY:
            return Response({
                "detail": "Cash on delivery -- no online payment needed.",
                "payment_status": order.payment_status,
            })

        if order.payment_status == Order.PaymentStatus.PAID:
            return Response({"detail": "Order already paid.", "payment_status": order.payment_status})

        phone = request.data.get("phone") or order.delivery_phone
        callback_url = request.build_absolute_uri(reverse("payment-webhook-momo"))
        return_url = request.data.get("return_url", "")

        result = payment_services.initiate_shop_order_payment(
            order, phone=phone, callback_url=callback_url, return_url=return_url
        )
        order.refresh_from_db(fields=["payment_status", "payment_reference"])

        response_data = {"success": bool(result.get("success")), "payment_status": order.payment_status}
        if order.payment_method == Order.PaymentMethod.HUBTEL_CHECKOUT:
            response_data["checkout_url"] = result.get("checkout_url")
        if not result.get("success"):
            response_data["error"] = result.get("error", "Payment initiation failed.")
        return Response(response_data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def set_status(self, request, pk=None):
        """POST /api/community/orders/{id}/set_status/  {"status": "fulfilled"}"""
        order = self.get_object()
        new_status = request.data.get("status")
        valid = [c[0] for c in Order.Status.choices]
        if new_status not in valid:
            return Response({"detail": f"status must be one of {valid}."}, status=400)
        order.status = new_status
        update_fields = ["status"]
        # Cash physically changes hands at delivery -- marking a COD order
        # fulfilled is the admin's confirmation that the cash was collected.
        if (
            new_status == Order.Status.FULFILLED
            and order.payment_method == Order.PaymentMethod.CASH_ON_DELIVERY
            and order.payment_status == Order.PaymentStatus.COLLECT_ON_DELIVERY
        ):
            order.payment_status = Order.PaymentStatus.PAID
            update_fields.append("payment_status")
        order.save(update_fields=update_fields)
        return Response(OrderSerializer(order).data)
