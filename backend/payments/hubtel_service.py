"""
Hubtel integration.
Docs: https://developers.hubtel.com

Used for:
  - Agent payouts where the agent's network is Vodafone Cash or AirtelTigo
    Money (Hubtel aggregates all three networks, MTN included as fallback)
  - Funder procurement payments (Hubtel Checkout supports MoMo/card/bank in
    one integration, which better matches how NGOs/corporates actually pay)
"""

import uuid

import requests
from requests.auth import HTTPBasicAuth
from django.conf import settings

SEND_MONEY_URL = "https://api-txnstatus.hubtel.com/transactions/{merchant}/send"  # placeholder path, confirm against current Hubtel docs at integration time
CHECKOUT_URL = "https://payproxyapi.hubtel.com/items/initiate"


def _auth():
    return HTTPBasicAuth(settings.HUBTEL_CLIENT_ID, settings.HUBTEL_CLIENT_SECRET)


def send_money(phone_number: str, network: str, amount: str, reason: str = "LaafiTech agent payout") -> dict:
    """
    Disburse funds to an agent via Hubtel (covers Vodafone Cash and
    AirtelTigo Money, used as the MTN fallback too).
    network: "vodafone" | "airteltigo" | "mtn"
    """
    reference_id = str(uuid.uuid4())
    payload = {
        "RecipientName": reason,
        "RecipientMsisdn": phone_number,
        "Channel": _channel_code(network),
        "Amount": amount,
        "PrimaryCallbackUrl": "",  # set to your webhook URL in production
        "Description": reason,
        "ClientReference": reference_id,
    }
    try:
        resp = requests.post(
            SEND_MONEY_URL.format(merchant=settings.HUBTEL_MERCHANT_ACCOUNT_NUMBER),
            json=payload,
            auth=_auth(),
            timeout=15,
        )
        success = resp.status_code in (200, 201)
        return {"success": success, "reference_id": reference_id, "status_code": resp.status_code, "raw": _safe_json(resp)}
    except requests.RequestException as exc:
        return {"success": False, "reference_id": reference_id, "error": str(exc)}


def initiate_checkout(amount: str, description: str, callback_url: str, return_url: str, customer_phone: str = "") -> dict:
    """
    Funder-facing checkout (procurement payments). Hubtel's checkout page
    supports MoMo (all networks), cards, and bank transfer -- this is the
    PRIMARY rail for inbound funder payments since funders may not all be
    on mobile money.
    """
    reference_id = str(uuid.uuid4())
    payload = {
        "totalAmount": amount,
        "description": description,
        "callbackUrl": callback_url,
        "returnUrl": return_url,
        "merchantAccountNumber": settings.HUBTEL_MERCHANT_ACCOUNT_NUMBER,
        "clientReference": reference_id,
        "customerMsisdn": customer_phone,
    }
    try:
        resp = requests.post(CHECKOUT_URL, json=payload, auth=_auth(), timeout=15)
        success = resp.status_code in (200, 201)
        data = _safe_json(resp)
        return {
            "success": success,
            "reference_id": reference_id,
            "checkout_url": data.get("data", {}).get("checkoutUrl") if success else None,
            "raw": data,
        }
    except requests.RequestException as exc:
        return {"success": False, "reference_id": reference_id, "error": str(exc)}


def _channel_code(network: str) -> str:
    return {
        "mtn": "mtn-gh",
        "vodafone": "vodafone-gh",
        "airteltigo": "tigo-gh",
    }.get(network, "mtn-gh")


def _safe_json(resp):
    try:
        return resp.json()
    except ValueError:
        return {"raw_text": resp.text}
