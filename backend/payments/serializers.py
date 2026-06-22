from rest_framework import serializers

from .models import PaymentTransaction, Payout


class PayoutSerializer(serializers.ModelSerializer):
    agent_code = serializers.CharField(source="agent.agent_code", read_only=True)
    distribution_count = serializers.SerializerMethodField()

    class Meta:
        model = Payout
        fields = [
            "id", "agent", "agent_code", "amount", "method", "provider_reference",
            "status", "period_start", "period_end", "initiated_by",
            "distribution_records", "distribution_count", "created_at", "completed_at",
        ]
        read_only_fields = ["id", "method", "provider_reference", "status", "created_at", "completed_at"]

    def get_distribution_count(self, obj):
        return obj.distribution_records.count()


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = "__all__"
        read_only_fields = [f.name for f in PaymentTransaction._meta.fields]
