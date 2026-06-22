from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import HubtelCallbackView, MomoCallbackView, PaymentTransactionViewSet, PayoutViewSet

router = DefaultRouter()
router.register("payouts", PayoutViewSet, basename="payout")
router.register("transactions", PaymentTransactionViewSet, basename="payment-transaction")

urlpatterns = router.urls + [
    path("webhooks/hubtel/", HubtelCallbackView.as_view(), name="payment-webhook-hubtel"),
    path("webhooks/momo/", MomoCallbackView.as_view(), name="payment-webhook-momo"),
]
