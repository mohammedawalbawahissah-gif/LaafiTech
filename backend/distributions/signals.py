"""
Django signals for DistributionRecord.

When a DistributionRecord is verified:
  1. Deduct the quantity from the agent's inventory allocations (FIFO).
  2. Accrue earnings into a pending Payout for the current month.
"""
import calendar
from decimal import Decimal

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import DistributionRecord


@receiver(post_save, sender=DistributionRecord)
def on_distribution_save(sender, instance, created, **kwargs):
    """Fire side-effects only when verification_status changes to 'verified'."""
    if instance.verification_status != DistributionRecord.VerificationStatus.VERIFIED:
        return

    # Use update_fields to detect deliberate status transitions; if the
    # signal fires on a full save we check whether the record is newly
    # verified by comparing to the DB state is expensive, so we guard with
    # a flag set by the verify action view instead.
    #
    # The verify action in distributions/views.py sets instance._just_verified
    # before calling save() so we don't double-trigger on unrelated field saves.
    if not getattr(instance, "_just_verified", False):
        return

    with transaction.atomic():
        _deduct_inventory(instance)
        _accrue_payout(instance)


def _deduct_inventory(record: DistributionRecord):
    """FIFO deduction of record.quantity from the agent's inventory allocations."""
    from agents.models import AgentInventoryAllocation

    remaining_to_deduct = record.quantity
    allocations = AgentInventoryAllocation.objects.filter(
        agent=record.agent,
        quantity_remaining__gt=0,
    ).order_by("allocation_date")

    for alloc in allocations:
        if remaining_to_deduct <= 0:
            break
        deduct = min(alloc.quantity_remaining, remaining_to_deduct)
        alloc.quantity_remaining -= deduct
        alloc.save(update_fields=["quantity_remaining"])
        remaining_to_deduct -= deduct


def _accrue_payout(record: DistributionRecord):
    """
    Add this record's earnings to the agent's pending payout for the current
    calendar month. Creates the payout record if one doesn't exist yet.
    """
    from payments.models import Payout

    today = timezone.now().date()
    period_start = today.replace(day=1)
    last_day = calendar.monthrange(today.year, today.month)[1]
    period_end = today.replace(day=last_day)

    earned = Decimal(str(record.unit_price)) * record.quantity

    payout, _ = Payout.objects.get_or_create(
        agent=record.agent,
        status=Payout.Status.PENDING,
        period_start=period_start,
        period_end=period_end,
        defaults={
            "amount": Decimal("0.00"),
            "method": record.agent.resolve_payout_method(),
        },
    )
    payout.amount = (payout.amount or Decimal("0.00")) + earned
    payout.save(update_fields=["amount"])
    payout.distribution_records.add(record)
