from django.conf import settings
from django.db import models


class Agent(models.Model):
    """
    Profile extension for users with role=agent. Holds the operational
    fields needed for inventory tracking and payout routing.
    """

    class MomoProvider(models.TextChoices):
        MTN = "mtn", "MTN MoMo"
        VODAFONE = "vodafone", "Vodafone Cash"
        AIRTELTIGO = "airteltigo", "AirtelTigo Money"

    class PayoutMethod(models.TextChoices):
        NATIVE_MOMO = "native_momo", "Native MTN MoMo"
        HUBTEL = "hubtel", "Hubtel"

    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        SUSPENDED = "suspended", "Suspended"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_profile")
    agent_code = models.CharField(max_length=20, unique=True)
    catchment_area = models.CharField(max_length=150, help_text="Community / area the agent primarily serves")
    gps_home_lat = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    gps_home_lng = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    verification_status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)

    mobile_money_number = models.CharField(max_length=20)
    momo_provider = models.CharField(max_length=20, choices=MomoProvider.choices)
    payout_method = models.CharField(max_length=20, choices=PayoutMethod.choices, default=PayoutMethod.NATIVE_MOMO)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.agent_code} - {self.user.get_full_name()}"

    @property
    def current_inventory_balance(self):
        return sum(a.quantity_remaining for a in self.inventory_allocations.all())

    @property
    def total_distributed_lifetime(self):
        return sum(d.quantity for d in self.distribution_records.filter(verification_status="verified"))

    def resolve_payout_method(self):
        """
        Routing logic: MTN agents default to the cheaper native MoMo rail;
        all other networks (Vodafone Cash, AirtelTigo Money) route through
        Hubtel, which aggregates them. Native MoMo failures also fall back
        to Hubtel (handled in payments.services).
        """
        if self.momo_provider == self.MomoProvider.MTN:
            return self.PayoutMethod.NATIVE_MOMO
        return self.PayoutMethod.HUBTEL


class AgentInventoryAllocation(models.Model):
    """Stock handed to a specific agent from a production batch."""

    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name="inventory_allocations")
    batch = models.ForeignKey("inventory.InventoryBatch", on_delete=models.CASCADE, related_name="allocations")
    quantity_allocated = models.PositiveIntegerField()
    quantity_remaining = models.PositiveIntegerField()
    allocation_date = models.DateTimeField(auto_now_add=True)
    restock_requested = models.BooleanField(default=False)
    restock_notes = models.TextField(blank=True, help_text="Agent's note accompanying the restock request (e.g. quantity needed, reason).")

    def __str__(self):
        return f"{self.agent.agent_code} <- {self.quantity_allocated} units (batch {self.batch_id})"
