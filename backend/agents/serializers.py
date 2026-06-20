from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Agent, AgentInventoryAllocation


class AgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    current_inventory_balance = serializers.ReadOnlyField()
    total_distributed_lifetime = serializers.ReadOnlyField()

    class Meta:
        model = Agent
        fields = [
            "id", "user", "agent_code", "catchment_area",
            "gps_home_lat", "gps_home_lng", "verification_status",
            "mobile_money_number", "momo_provider", "payout_method",
            "current_inventory_balance", "total_distributed_lifetime",
            "created_at",
        ]
        read_only_fields = ["id", "verification_status", "created_at"]


class AgentInventoryAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentInventoryAllocation
        fields = ["id", "agent", "batch", "quantity_allocated", "quantity_remaining", "allocation_date", "restock_requested"]
        read_only_fields = ["id", "allocation_date"]
