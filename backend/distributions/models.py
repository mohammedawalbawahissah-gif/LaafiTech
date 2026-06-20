from django.conf import settings
from django.db import models


class School(models.Model):
    """A school or community location that receives distributions."""

    name = models.CharField(max_length=200)
    district = models.CharField(max_length=100, default="Kumbungu")
    region = models.CharField(max_length=100, default="Northern")
    gps_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    estimated_girls_population = models.PositiveIntegerField(default=0)
    partner_organization = models.CharField(max_length=150, blank=True)

    # Inputs for the AI need-priority score (see ai_services.services.score_need_priority)
    poverty_index = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text="District-level multidimensional poverty % (from GSS data)",
    )
    distance_to_market_km = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    historical_absenteeism_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="% of menstruating girls reporting period-related absenteeism, if known",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.district})"


class DistributionRecord(models.Model):
    """
    The atomic unit of the platform: simultaneously a sales/distribution
    transaction AND a verifiable impact data point shown to funders.
    """

    class RecipientType(models.TextChoices):
        INDIVIDUAL = "individual", "Individual"
        SCHOOL = "school", "School"
        COMMUNITY_GROUP = "community_group", "Community Group"

    class PaymentType(models.TextChoices):
        CASH = "cash", "Cash"
        MOMO = "momo", "Mobile Money"
        SUBSIDIZED = "subsidized", "Subsidized"
        FREE = "free", "Free (funded)"

    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        FLAGGED = "flagged", "Flagged"
        REJECTED = "rejected", "Rejected"

    agent = models.ForeignKey("agents.Agent", on_delete=models.PROTECT, related_name="distribution_records")
    recipient_type = models.CharField(max_length=20, choices=RecipientType.choices)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name="distribution_records")

    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    payment_type = models.CharField(max_length=20, choices=PaymentType.choices)

    gps_lat = models.DecimalField(max_digits=9, decimal_places=6)
    gps_lng = models.DecimalField(max_digits=9, decimal_places=6)
    photo_url = models.URLField(help_text="Cloudinary URL of proof-of-distribution photo")
    photo_hash = models.CharField(
        max_length=64, blank=True, db_index=True,
        help_text="Perceptual hash for AI duplicate-photo detection (ai_services)",
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    verification_status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="verified_records",
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    # AI verification-assist outputs (see ai_services.services.flag_anomalous_distribution)
    ai_anomaly_flags = models.JSONField(default=list, blank=True, help_text="List of flag codes raised by the verification-assist checks")
    ai_anomaly_score = models.DecimalField(max_digits=4, decimal_places=2, default=0, help_text="0 (clean) - 1 (highly suspicious)")

    notes = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["verification_status"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.agent.agent_code} -> {self.quantity} units ({self.verification_status})"
