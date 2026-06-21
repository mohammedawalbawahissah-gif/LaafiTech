from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CycleLog, Order, Product
from .serializers import CycleLogSerializer, OrderSerializer, ProductSerializer


class IsCommunityUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "community_user"


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("admin", "superadmin")


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
    """Shop catalog. Anyone logged in can browse; only admins manage it."""

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
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
        serializer.save(
            user=self.request.user,
            total_price=product.price * quantity,
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def set_status(self, request, pk=None):
        """POST /api/community/orders/{id}/set_status/  {"status": "fulfilled"}"""
        order = self.get_object()
        new_status = request.data.get("status")
        valid = [c[0] for c in Order.Status.choices]
        if new_status not in valid:
            return Response({"detail": f"status must be one of {valid}."}, status=400)
        order.status = new_status
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)
