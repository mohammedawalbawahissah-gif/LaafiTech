from django.contrib import admin

from .models import ImpactReport


@admin.register(ImpactReport)
class ImpactReportAdmin(admin.ModelAdmin):
    list_display = ["scope", "scope_reference", "period_start", "period_end", "pads_distributed_count", "girls_reached_estimate"]
    list_filter = ["scope"]
