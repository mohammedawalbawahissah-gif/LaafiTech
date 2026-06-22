from django.conf import settings
from django.db import models


class FunderOrganization(models.Model):
    class FunderType(models.TextChoices):
        NGO = "ngo", "NGO"
        CORPORATE_CSR = "corporate_csr", "Corporate CSR"
        GOVERNMENT = "government", "Government"
        INDIVIDUAL_DONOR = "individual_donor", "Individual Donor"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="funder_profile")
    name = models.CharField(max_length=200)
    funder_type = models.CharField(max_length=20, choices=FunderType.choices)
    contact_person = models.CharField(max_length=150, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProcurementOrder(models.Model):
    """A funder 'buying' a batch of verified deliveries to a target
    school/district, rather than donating to a generic campaign."""

    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending Payment"
        PAID = "paid", "Paid"
        FULFILLING = "fulfilling", "Fulfilling"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        MOMO_PROMPT = "momo_prompt", "MTN MoMo (USSD prompt)"
        HUBTEL_CHECKOUT = "hubtel_checkout", "Card / Bank / Other MoMo (Hubtel)"

    funder = models.ForeignKey(FunderOrganization, on_delete=models.PROTECT, related_name="procurement_orders")
    target_school = models.ForeignKey("distributions.School", on_delete=models.PROTECT, related_name="procurement_orders")
    quantity_requested = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_PAYMENT)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.HUBTEL_CHECKOUT)

    linked_distribution_records = models.ManyToManyField(
        "distributions.DistributionRecord", blank=True, related_name="procurement_orders"
    )
    payment_reference = models.CharField(max_length=100, blank=True)

    # Cached AI-generated narrative for this order (see ai_services.services.generate_impact_narrative)
    impact_narrative = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity_requested * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.funder.name} -> {self.target_school.name} ({self.quantity_requested} units)"
