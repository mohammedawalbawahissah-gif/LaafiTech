"""
Payment routing logic. This is the single place that decides which rail
(native MTN MoMo vs Hubtel) handles a given payout or procurement payment.
"""

from django.utils import timezone

from . import hubtel_service, momo_service
from .models import PaymentTransaction, Payout


def process_agent_payout(payout: Payout) -> PaymentTransaction:
    """
    Routing rule:
      - MTN agents: try native MoMo Disbursement first (lower fees, faster).
        On failure, fall back to Hubtel Send Money.
      - Vodafone / AirtelTigo agents: go straight to Hubtel Send Money,
        since native MoMo only covers the MTN network.
    """
    agent = payout.agent
    amount = str(payout.amount)

    if agent.momo_provider == agent.MomoProvider.MTN:
        result = momo_service.disburse(agent.mobile_money_number, amount, reason=f"LaafiTech payout #{payout.id}")
        provider = PaymentTransaction.Provider.MTN_MOMO
        if not result.get("success"):
            # fallback
            result = hubtel_service.send_money(agent.mobile_money_number, "mtn", amount, reason=f"LaafiTech payout #{payout.id} (fallback)")
            provider = PaymentTransaction.Provider.HUBTEL
    else:
        result = hubtel_service.send_money(agent.mobile_money_number, agent.momo_provider, amount, reason=f"LaafiTech payout #{payout.id}")
        provider = PaymentTransaction.Provider.HUBTEL

    txn = PaymentTransaction.objects.create(
        direction=PaymentTransaction.Direction.OUTBOUND_PAYOUT,
        provider=provider,
        payout=payout,
        amount=payout.amount,
        provider_transaction_id=result.get("reference_id", ""),
        status="completed" if result.get("success") else "failed",
        raw_response=result.get("raw", {"error": result.get("error", "")}),
    )

    payout.status = Payout.Status.COMPLETED if result.get("success") else Payout.Status.FAILED
    payout.provider_reference = result.get("reference_id", "")
    payout.method = Payout.Method.NATIVE_MOMO if provider == PaymentTransaction.Provider.MTN_MOMO else Payout.Method.HUBTEL
    if result.get("success"):
        payout.completed_at = timezone.now()
    payout.save(update_fields=["status", "provider_reference", "method", "completed_at"])

    return txn


def initiate_procurement_payment(order, callback_url: str, return_url: str) -> dict:
    """
    Routing rule for inbound funder payments: default to Hubtel Checkout
    (covers MoMo/card/bank in one flow -- funders are organizations, not
    individuals, so card/bank transfer support matters more here than on
    the agent payout side).
    """
    result = hubtel_service.initiate_checkout(
        amount=str(order.total_amount),
        description=f"LaafiTech procurement order #{order.id} - {order.target_school.name}",
        callback_url=callback_url,
        return_url=return_url,
    )

    PaymentTransaction.objects.create(
        direction=PaymentTransaction.Direction.INBOUND_PROCUREMENT,
        provider=PaymentTransaction.Provider.HUBTEL,
        procurement_order=order,
        amount=order.total_amount,
        provider_transaction_id=result.get("reference_id", ""),
        status="initiated" if result.get("success") else "failed",
        raw_response=result.get("raw", {}),
    )

    return result
