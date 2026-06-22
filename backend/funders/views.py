from django.urls import reverse
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ai_services.services import generate_impact_narrative
from payments.services import initiate_procurement_payment
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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IsFunderRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "funder"


class ProcurementOrderViewSet(viewsets.ModelViewSet):
    queryset = ProcurementOrder.objects.select_related("funder", "target_school").all().order_by("-created_at")
    serializer_class = ProcurementOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "funder", "target_school"]

    def get_permissions(self):
        # Creating a procurement order is funder self-service (there's no
        # admin UI for it) -- the `funder` FK is always auto-assigned from
        # the logged-in funder's own profile below, never client-supplied,
        # so anyone without a funder_profile must not be allowed to create.
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsFunderRole()]
        return [permissions.IsAuthenticated()]

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

    def perform_create(self, serializer):
        funder_profile = getattr(self.request.user, "funder_profile", None)
        if funder_profile is None:
            # Auto-create a placeholder profile for legacy funder accounts
            # that pre-date the registration auto-create. New signups always
            # get one created atomically in RegisterSerializer.create().
            funder_profile = FunderOrganization.objects.create(
                user=self.request.user,
                name=self.request.user.get_full_name() or self.request.user.username,
                funder_type=FunderOrganization.FunderType.INDIVIDUAL_DONOR,
            )
        serializer.save(funder=funder_profile)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        """
        POST /api/procurement-orders/{id}/pay/
        Body:
          - momo_prompt orders: {"phone": "0244..."}  (required)
          - hubtel_checkout orders: {"return_url": "https://..."}  (optional)
        """
        order = self.get_object()
        if order.status != ProcurementOrder.Status.PENDING_PAYMENT:
            return Response({"detail": f"Order is already {order.status}."}, status=400)

        phone = request.data.get("phone", "")
        callback_url = request.build_absolute_uri(reverse("payment-webhook-hubtel"))
        return_url = request.data.get("return_url", "")

        if order.payment_method == ProcurementOrder.PaymentMethod.MOMO_PROMPT and not phone:
            return Response({"detail": "phone is required for MTN MoMo payments."}, status=400)

        result = initiate_procurement_payment(
            order, callback_url=callback_url, return_url=return_url, phone=phone
        )

        if not result.get("success"):
            return Response({"detail": result.get("error", "Payment initiation failed.")}, status=502)

        if order.payment_method == ProcurementOrder.PaymentMethod.MOMO_PROMPT:
            return Response({
                "success": True,
                "detail": "MoMo prompt sent — approve it on your phone to complete payment.",
                "reference_id": result.get("reference_id"),
            })
        return Response({"checkout_url": result.get("checkout_url"), "reference_id": result.get("reference_id")})

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
