"""
Native MTN MoMo integration (Collections + Disbursements).
Docs: https://momodeveloper.mtn.com

Used as the PRIMARY rail for:
  - Agent payouts where the agent's registered network is MTN (Disbursements)
  - Funder payments when a funder explicitly selects "Pay with MTN MoMo" (Collections)
"""

import uuid

import requests
from django.conf import settings

BASE_URL = (
    "https://sandbox.momodeveloper.mtn.com"
    if settings.MTN_MOMO_ENV == "sandbox"
    else "https://proxy.momoapi.mtn.com"
)


class MomoError(Exception):
    pass


def _headers(product: str, extra: dict | None = None) -> dict:
    headers = {
        "Ocp-Apim-Subscription-Key": settings.MTN_MOMO_SUBSCRIPTION_KEY,
        "X-Target-Environment": settings.MTN_MOMO_TARGET_ENV,
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def disburse(phone_number: str, amount: str, currency: str = "GHS", reason: str = "LaafiTech agent payout") -> dict:
    """
    Send money to an agent's MTN MoMo wallet (Disbursements product).
    Returns a dict: {"success": bool, "reference_id": str, "raw": dict}
    """
    reference_id = str(uuid.uuid4())
    payload = {
        "amount": amount,
        "currency": currency,
        "externalId": reference_id,
        "payee": {"partyIdType": "MSISDN", "partyId": phone_number},
        "payerMessage": reason,
        "payeeNote": reason,
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/disbursement/v1_0/transfer",
            json=payload,
            headers=_headers("disbursement", {"X-Reference-Id": reference_id}),
            timeout=15,
        )
        success = resp.status_code in (200, 202)
        return {"success": success, "reference_id": reference_id, "status_code": resp.status_code, "raw": _safe_json(resp)}
    except requests.RequestException as exc:
        return {"success": False, "reference_id": reference_id, "error": str(exc)}


def request_to_pay(phone_number: str, amount: str, currency: str = "GHS", reason: str = "LaafiTech procurement payment") -> dict:
    """Collections product -- request a funder to pay via MTN MoMo."""
    reference_id = str(uuid.uuid4())
    payload = {
        "amount": amount,
        "currency": currency,
        "externalId": reference_id,
        "payer": {"partyIdType": "MSISDN", "partyId": phone_number},
        "payerMessage": reason,
        "payeeNote": reason,
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/collection/v1_0/requesttopay",
            json=payload,
            headers=_headers("collection", {"X-Reference-Id": reference_id}),
            timeout=15,
        )
        success = resp.status_code in (200, 202)
        return {"success": success, "reference_id": reference_id, "status_code": resp.status_code, "raw": _safe_json(resp)}
    except requests.RequestException as exc:
        return {"success": False, "reference_id": reference_id, "error": str(exc)}


def _safe_json(resp):
    try:
        return resp.json()
    except ValueError:
        return {"raw_text": resp.text}
