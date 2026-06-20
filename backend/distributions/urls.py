from rest_framework.routers import DefaultRouter

from .views import DistributionRecordViewSet, SchoolViewSet

router = DefaultRouter()
router.register("schools", SchoolViewSet, basename="school")
router.register("distributions", DistributionRecordViewSet, basename="distribution")

urlpatterns = router.urls
