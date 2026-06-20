from django.contrib import admin

from .models import FunderOrganization, ProcurementOrder


@admin.register(FunderOrganization)
class FunderOrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "funder_type", "is_verified"]
    list_filter = ["funder_type", "is_verified"]


@admin.register(ProcurementOrder)
class ProcurementOrderAdmin(admin.ModelAdmin):
    list_display = ["funder", "target_school", "quantity_requested", "total_amount", "status"]
    list_filter = ["status"]
