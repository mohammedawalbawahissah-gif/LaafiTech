from rest_framework import serializers

from .models import FunderOrganization, ProcurementOrder


class FunderOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FunderOrganization
        fields = ["id", "user", "name", "funder_type", "contact_person", "is_verified", "created_at"]
        read_only_fields = ["id", "user", "is_verified", "created_at"]


class ProcurementOrderSerializer(serializers.ModelSerializer):
    funder_name = serializers.CharField(source="funder.name", read_only=True)
    target_school_name = serializers.CharField(source="target_school.name", read_only=True)

    class Meta:
        model = ProcurementOrder
        fields = [
            "id", "funder", "funder_name", "target_school", "target_school_name",
            "quantity_requested", "unit_price", "total_amount", "status",
            "payment_method", "linked_distribution_records", "payment_reference",
            "impact_narrative", "created_at", "completed_at",
        ]
        read_only_fields = [
            "id", "funder", "total_amount", "status", "linked_distribution_records",
            "payment_reference", "impact_narrative", "created_at", "completed_at",
        ]
