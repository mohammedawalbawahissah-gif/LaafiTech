from django.conf import settings
from django.db import models


class CycleLog(models.Model):
    """A single logged menstrual cycle entry for one community_user."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cycle_logs")
    period_start = models.DateField()
    period_end = models.DateField(null=True, blank=True, help_text="Leave blank if still ongoing")
    symptoms = models.CharField(max_length=300, blank=True, help_text="Comma-separated, e.g. 'cramps, fatigue'")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_start"]

    def __str__(self):
        return f"{self.user_id} - cycle starting {self.period_start}"


class Product(models.Model):
    """Catalog item in the in-app shop. Admin-managed."""

    class Category(models.TextChoices):
        PADS = "pads", "Sanitary Pads"
        TAMPONS = "tampons", "Tampons"
        CUPS = "cups", "Menstrual Cups"
        HYGIENE = "hygiene", "Hygiene Essentials"
        OTHER = "other", "Other"

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.PADS)
    price = models.DecimalField(max_digits=8, decimal_places=2, help_text="GHS")
    image_url = models.URLField(blank=True)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return self.name


class Order(models.Model):
    """A community_user's request to purchase a Product.

    Note: no live payment gateway call happens here, consistent with other
    placeholder integration points elsewhere in this codebase (see the
    photo upload placeholder on distribution records). The order is
    recorded with the user's chosen payment intent; an admin marks it
    fulfilled once payment/delivery is confirmed out-of-band (MoMo prompt,
    cash on delivery, etc.) -- wiring a real MTN MoMo/Hubtel charge here is
    a follow-up, not done silently.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="orders")
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    delivery_phone = models.CharField(max_length=20)
    delivery_location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.product.name} x{self.quantity} ({self.status})"
