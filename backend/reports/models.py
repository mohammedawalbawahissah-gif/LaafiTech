from django.db import models


class ImpactReport(models.Model):
    """Cached/snapshot impact stats so dashboards don't recompute heavy
    aggregates on every request. Regenerate via a scheduled task."""

    class Scope(models.TextChoices):
        SCHOOL = "school", "School"
        DISTRICT = "district", "District"
        NATIONAL = "national", "National"

    scope = models.CharField(max_length=20, choices=Scope.choices)
    scope_reference = models.CharField(max_length=150, help_text="School name / district name / 'national'")
    period_start = models.DateField()
    period_end = models.DateField()

    girls_reached_estimate = models.PositiveIntegerField(default=0)
    pads_distributed_count = models.PositiveIntegerField(default=0)
    schools_covered_count = models.PositiveIntegerField(default=0)
    total_funder_contribution = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cost_per_girl = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.scope}:{self.scope_reference} ({self.period_start} - {self.period_end})"
