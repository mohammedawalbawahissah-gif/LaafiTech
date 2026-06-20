from rest_framework.routers import DefaultRouter

from .views import PaymentTransactionViewSet, PayoutViewSet

router = DefaultRouter()
router.register("payouts", PayoutViewSet, basename="payout")
router.register("transactions", PaymentTransactionViewSet, basename="payment-transaction")

urlpatterns = router.urls
