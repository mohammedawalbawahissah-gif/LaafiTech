from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DistributionRecordViewSet, PhotoUploadView, SchoolViewSet

router = DefaultRouter()
router.register("schools", SchoolViewSet, basename="school")
router.register("distributions", DistributionRecordViewSet, basename="distribution")

# photo-upload MUST come before router.urls — the router's detail route
# distributions/{pk}/ would otherwise match "photo-upload" as a pk value,
# returning 405 Method Not Allowed before this view ever runs.
urlpatterns = [
    path("distributions/photo-upload/", PhotoUploadView.as_view(), name="distribution-photo-upload"),
] + router.urls
