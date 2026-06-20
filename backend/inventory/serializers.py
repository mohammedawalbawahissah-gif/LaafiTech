from rest_framework import serializers

from .models import InventoryBatch


class InventoryBatchSerializer(serializers.ModelSerializer):
    quantity_allocated = serializers.ReadOnlyField()
    quantity_available = serializers.ReadOnlyField()

    class Meta:
        model = InventoryBatch
        fields = [
            "id", "batch_code", "production_date", "quantity_produced",
            "unit_cost", "status", "notes", "quantity_allocated",
            "quantity_available", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
