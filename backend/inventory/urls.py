from rest_framework.routers import DefaultRouter

from .views import InventoryBatchViewSet

router = DefaultRouter()
router.register("batches", InventoryBatchViewSet, basename="inventory-batch")

urlpatterns = router.urls
