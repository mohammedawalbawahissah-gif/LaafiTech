from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("agents.urls")),
    path("api/", include("inventory.urls")),
    path("api/", include("distributions.urls")),
    path("api/", include("funders.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("reports.urls")),
    path("api/ai/", include("ai_services.urls")),
    path("api/community/", include("community.urls")),
]
