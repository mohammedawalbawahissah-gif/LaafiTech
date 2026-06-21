from rest_framework.routers import DefaultRouter

from .views import CycleLogViewSet, OrderViewSet, ProductViewSet

router = DefaultRouter()
router.register("cycle-logs", CycleLogViewSet, basename="cycle-log")
router.register("products", ProductViewSet, basename="product")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = router.urls
