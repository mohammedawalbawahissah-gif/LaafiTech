from django.db import models


class InventoryBatch(models.Model):
    """A production run of reusable pads from LaafiTech manufacturing."""

    class Status(models.TextChoices):
        IN_PRODUCTION = "in_production", "In Production"
        ALLOCATED = "allocated", "Allocated"
        DISTRIBUTED = "distributed", "Distributed"
        DEPLETED = "depleted", "Depleted"

    batch_code = models.CharField(max_length=30, unique=True)
    production_date = models.DateField()
    quantity_produced = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=8, decimal_places=2, help_text="Production cost per unit (GHS)")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PRODUCTION)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.batch_code} ({self.quantity_produced} units)"

    @property
    def quantity_allocated(self):
        return sum(a.quantity_allocated for a in self.allocations.all())

    @property
    def quantity_available(self):
        return self.quantity_produced - self.quantity_allocated
