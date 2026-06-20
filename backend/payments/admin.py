from django.contrib import admin

from .models import PaymentTransaction, Payout


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ["id", "agent", "amount", "method", "status", "created_at"]
    list_filter = ["method", "status"]


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ["id", "direction", "provider", "amount", "status", "created_at"]
    list_filter = ["direction", "provider", "status"]
