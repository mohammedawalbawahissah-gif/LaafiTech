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


def initiate_procurement_payment(order, callback_url: str, return_url: str, phone: str = "") -> dict:
    """
    Routing rule for inbound funder payments:
      - momo_prompt: native MTN MoMo Collections request-to-pay (USSD push).
        Requires a phone number -- falls back to hubtel_checkout if none given.
      - hubtel_checkout (default): Hubtel Checkout covers MoMo/card/bank in
        one flow -- better for NGOs/corporates that may pay by card or bank.
    """
    from funders.models import ProcurementOrder

    use_momo = (
        order.payment_method == ProcurementOrder.PaymentMethod.MOMO_PROMPT
        and phone
    )

    if use_momo:
        result = momo_service.request_to_pay(
            phone, str(order.total_amount),
            reason=f"LaafiTech procurement order #{order.id} - {order.target_school.name}",
            callback_url=callback_url,
        )
        provider = PaymentTransaction.Provider.MTN_MOMO
    else:
        result = hubtel_service.initiate_checkout(
            amount=str(order.total_amount),
            description=f"LaafiTech procurement order #{order.id} - {order.target_school.name}",
            callback_url=callback_url,
            return_url=return_url,
            customer_phone=phone,
        )
        provider = PaymentTransaction.Provider.HUBTEL

    PaymentTransaction.objects.create(
        direction=PaymentTransaction.Direction.INBOUND_PROCUREMENT,
        provider=provider,
        procurement_order=order,
        amount=order.total_amount,
        provider_transaction_id=result.get("reference_id", ""),
        status="initiated" if result.get("success") else "failed",
        raw_response=result.get("raw", {}),
    )

    return result


def initiate_shop_order_payment(order, phone: str, callback_url: str, return_url: str = "") -> dict:
    """
    Routing for community shop orders -- mirrors the FarmAsyst North
    payment pattern (MoMo prompt for a direct USSD push, card/bank via a
    hosted checkout redirect), plus cash_on_delivery which this function
    isn't called for at all (handled entirely in community.views).

      - momo_prompt: native MTN MoMo Collections request-to-pay, pushes a
        USSD approval prompt straight to the customer's phone.
      - hubtel_checkout: Hubtel's hosted checkout page, covering card, bank
        transfer, and the other MoMo networks in one redirect.

    `order` is a community.models.Order instance. Imported locally to
    avoid a module-level cross-app import at Django startup.
    """
    from community.models import Order

    if order.payment_method == Order.PaymentMethod.MOMO_PROMPT:
        result = momo_service.request_to_pay(
            phone, str(order.total_price),
            reason=f"LaafiTech order #{order.id}",
            callback_url=callback_url,
        )
        provider = PaymentTransaction.Provider.MTN_MOMO
    elif order.payment_method == Order.PaymentMethod.HUBTEL_CHECKOUT:
        result = hubtel_service.initiate_checkout(
            amount=str(order.total_price),
            description=f"LaafiTech shop order #{order.id}",
            callback_url=callback_url,
            return_url=return_url,
            customer_phone=phone,
        )
        provider = PaymentTransaction.Provider.HUBTEL
    else:
        return {"success": False, "error": "This order's payment method doesn't require an online charge."}

    PaymentTransaction.objects.create(
        direction=PaymentTransaction.Direction.INBOUND_SHOP_ORDER,
        provider=provider,
        shop_order=order,
        amount=order.total_price,
        provider_transaction_id=result.get("reference_id", ""),
        status="initiated" if result.get("success") else "failed",
        raw_response=result.get("raw", {"error": result.get("error", "")}),
    )

    order.payment_reference = result.get("reference_id", "")
    order.payment_status = Order.PaymentStatus.PROCESSING if result.get("success") else Order.PaymentStatus.FAILED
    order.save(update_fields=["payment_reference", "payment_status"])

    return result
