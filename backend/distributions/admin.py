from django.contrib import admin

from .models import DistributionRecord, School


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ["name", "district", "region", "estimated_girls_population", "poverty_index"]
    list_filter = ["district", "region"]
    search_fields = ["name"]


@admin.register(DistributionRecord)
class DistributionRecordAdmin(admin.ModelAdmin):
    list_display = ["agent", "quantity", "verification_status", "ai_anomaly_score", "timestamp"]
    list_filter = ["verification_status", "payment_type"]
    readonly_fields = ["ai_anomaly_flags", "ai_anomaly_score", "photo_hash"]
