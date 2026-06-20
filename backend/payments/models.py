from django.db import models


class Payout(models.Model):
    """Money owed to an agent for verified distributions, paid via
    native MTN MoMo or Hubtel depending on the agent's network."""

    class Method(models.TextChoices):
        NATIVE_MOMO = "native_momo", "Native MTN MoMo"
        HUBTEL = "hubtel", "Hubtel"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    agent = models.ForeignKey("agents.Agent", on_delete=models.PROTECT, related_name="payouts")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices)
    provider_reference = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    period_start = models.DateField()
    period_end = models.DateField()
    initiated_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, related_name="initiated_payouts")
    distribution_records = models.ManyToManyField("distributions.DistributionRecord", related_name="payouts")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payout {self.id} - {self.agent.agent_code} - GHS {self.amount} ({self.status})"


class PaymentTransaction(models.Model):
    """
    Audit log for every payment event (agent payout OR funder procurement
    payment) across both rails. Funder trust depends on this being complete
    and immutable -- never delete rows here, only append.
    """

    class Direction(models.TextChoices):
        OUTBOUND_PAYOUT = "outbound_payout", "Outbound Agent Payout"
        INBOUND_PROCUREMENT = "inbound_procurement", "Inbound Funder Payment"

    class Provider(models.TextChoices):
        MTN_MOMO = "mtn_momo", "MTN MoMo (native)"
        HUBTEL = "hubtel", "Hubtel"

    direction = models.CharField(max_length=30, choices=Direction.choices)
    provider = models.CharField(max_length=20, choices=Provider.choices)
    payout = models.ForeignKey(Payout, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")
    procurement_order = models.ForeignKey(
        "funders.ProcurementOrder", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    provider_transaction_id = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=20, default="initiated")
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.direction} - GHS {self.amount} via {self.provider} ({self.status})"
