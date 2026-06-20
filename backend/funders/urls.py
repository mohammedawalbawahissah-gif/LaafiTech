from rest_framework.routers import DefaultRouter

from .views import FunderOrganizationViewSet, ProcurementOrderViewSet

router = DefaultRouter()
router.register("funder-organizations", FunderOrganizationViewSet, basename="funder-org")
router.register("procurement-orders", ProcurementOrderViewSet, basename="procurement-order")

urlpatterns = router.urls
