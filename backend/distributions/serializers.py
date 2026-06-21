from rest_framework import serializers

from .models import DistributionRecord, School


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class DistributionRecordSerializer(serializers.ModelSerializer):
    agent_code = serializers.CharField(source="agent.agent_code", read_only=True)
    school_name = serializers.CharField(source="school.name", read_only=True)

    class Meta:
        model = DistributionRecord
        fields = [
            "id", "agent", "agent_code", "recipient_type", "school", "school_name",
            "quantity", "unit_price", "payment_type",
            "gps_lat", "gps_lng", "photo_url", "photo_hash",
            "timestamp", "verification_status", "verified_by", "verified_at",
            "ai_anomaly_flags", "ai_anomaly_score", "notes",
        ]
        read_only_fields = [
            "id", "agent", "timestamp", "verification_status", "verified_by", "verified_at",
            "ai_anomaly_flags", "ai_anomaly_score", "photo_hash",
        ]

    def validate(self, attrs):
        agent = attrs.get("agent") or getattr(self.instance, "agent", None)
        quantity = attrs.get("quantity") or getattr(self.instance, "quantity", None)
        if agent and quantity and agent.current_inventory_balance < quantity:
            raise serializers.ValidationError(
                "Agent does not have enough inventory balance for this distribution."
            )
        return attrs


class DistributionVerifySerializer(serializers.Serializer):
    """Admin action: approve/reject a pending or flagged distribution record."""
    decision = serializers.ChoiceField(choices=["verified", "rejected"])
    notes = serializers.CharField(required=False, allow_blank=True)
