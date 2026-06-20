from rest_framework.routers import DefaultRouter

from .views import ImpactReportViewSet

router = DefaultRouter()
router.register("impact-reports", ImpactReportViewSet, basename="impact-report")

urlpatterns = router.urls
