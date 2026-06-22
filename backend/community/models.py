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

    Payment is a two-step order-then-pay flow (mirrors the FarmAsyst North
    pattern): the order is created first with payment_status=pending, then
    the frontend calls the `pay` action to actually trigger a charge via
    payments.services.initiate_shop_order_payment(). cash_on_delivery skips
    that online-charge step entirely -- payment_status goes straight to
    collect_on_delivery and is only marked paid when an admin confirms the
    cash was collected (see OrderViewSet.set_status).
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        MOMO_PROMPT = "momo_prompt", "MTN MoMo Prompt"
        HUBTEL_CHECKOUT = "hubtel_checkout", "Card / Bank / Other MoMo (Hubtel)"
        CASH_ON_DELIVERY = "cash_on_delivery", "Cash on Delivery"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        COLLECT_ON_DELIVERY = "collect_on_delivery", "Collect on Delivery"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="orders")
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    delivery_phone = models.CharField(max_length=20)
    delivery_location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH_ON_DELIVERY)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_reference = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.product.name} x{self.quantity} ({self.status})"
