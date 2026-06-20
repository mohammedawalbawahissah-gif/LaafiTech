from rest_framework.routers import DefaultRouter

from .views import AgentInventoryAllocationViewSet, AgentViewSet

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")
router.register("allocations", AgentInventoryAllocationViewSet, basename="allocation")

urlpatterns = router.urls
