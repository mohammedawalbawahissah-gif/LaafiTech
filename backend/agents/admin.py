from django.contrib import admin

from .models import Agent, AgentInventoryAllocation


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ["agent_code", "user", "catchment_area", "verification_status", "momo_provider", "payout_method"]
    list_filter = ["verification_status", "momo_provider"]
    search_fields = ["agent_code", "user__username", "user__phone_number"]


@admin.register(AgentInventoryAllocation)
class AgentInventoryAllocationAdmin(admin.ModelAdmin):
    list_display = ["agent", "batch", "quantity_allocated", "quantity_remaining", "restock_requested"]
    list_filter = ["restock_requested"]
