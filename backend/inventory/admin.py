from django.contrib import admin

from .models import InventoryBatch


@admin.register(InventoryBatch)
class InventoryBatchAdmin(admin.ModelAdmin):
    list_display = ["batch_code", "production_date", "quantity_produced", "quantity_available", "status"]
    list_filter = ["status"]
