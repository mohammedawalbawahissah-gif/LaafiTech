"""
AI services for the LaafiTech platform.

Design principle: every AI feature here is explainable and human-in-the-loop.
Nothing here auto-verifies a distribution or auto-releases a payout -- AI
assists the admin reviewer and the funder's understanding, the platform's
"held until verified" policy is never bypassed by a model's output.

Four features (see architecture doc section 7):
  1. score_need_priority      - explainable, weighted need-targeting score
  2. generate_impact_narrative - Claude-generated funder-ready report text
  3. flag_anomalous_distribution - verification-assist (duplicate photo /
                                    GPS plausibility / volume anomaly)
  4. ask_education_assistant  - Claude-powered menstrual health Q&A,
                                 exposed via USSD/SMS/WhatsApp gateway
"""

import hashlib
from decimal import Decimal
from math import radians, sin, cos, sqrt, atan2

import requests
from django.conf import settings


# ---------------------------------------------------------------------------
# 1. Need-priority scoring (rule-based, explainable -- see architecture doc
#    7.1 for why explainable beats opaque ML for grant credibility)
# ---------------------------------------------------------------------------

WEIGHTS = {
    "poverty_index": 0.4,
    "distance_to_market": 0.25,
    "absenteeism_rate": 0.25,
    "population_scale": 0.10,
}


def score_need_priority(school) -> dict:
    """
    Returns {"score": 0-100, "factors": {...}} so both Admin and Funder UIs
    can show *why* a school ranks where it does, not just a black-box number.
    Normalizes each input against rough sensible ranges for Northern Ghana
    districts; recalibrate these ranges once enough School records exist.
    """
    poverty_component = min(float(school.poverty_index or 0) / 70.0, 1.0)  # 70% ~ Upper West-level poverty
    distance_component = min(float(school.distance_to_market_km or 0) / 30.0, 1.0)  # 30km treated as "far"
    absenteeism_component = (
        min(float(school.historical_absenteeism_rate) / 50.0, 1.0)
        if school.historical_absenteeism_rate is not None
        else 0.5  # unknown -> neutral midpoint, not zero (don't penalize missing data)
    )
    population_component = min(float(school.estimated_girls_population or 0) / 500.0, 1.0)

    factors = {
        "poverty_index": round(poverty_component * WEIGHTS["poverty_index"] * 100, 1),
        "distance_to_market": round(distance_component * WEIGHTS["distance_to_market"] * 100, 1),
        "absenteeism_rate": round(absenteeism_component * WEIGHTS["absenteeism_rate"] * 100, 1),
        "population_scale": round(population_component * WEIGHTS["population_scale"] * 100, 1),
    }
    score = round(sum(factors.values()), 1)

    return {"score": score, "factors": factors}


# ---------------------------------------------------------------------------
# 2. AI-generated impact narratives (Claude API)
# ---------------------------------------------------------------------------

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


def generate_impact_narrative(procurement_order) -> str:
    """
    Turns a ProcurementOrder's linked DistributionRecords into a short,
    funder-ready narrative report. Falls back to a templated summary if
    the API key isn't configured or the call fails -- this feature should
    never block order completion.
    """
    records = procurement_order.linked_distribution_records.filter(verification_status="verified")
    total_units = sum(r.quantity for r in records)
    schools = sorted({r.school.name for r in records if r.school})
    school = procurement_order.target_school

    stats_summary = (
        f"Funder: {procurement_order.funder.name}\n"
        f"Target school/area: {school.name}, {school.district} District\n"
        f"Verified units delivered: {total_units}\n"
        f"Schools/communities reached: {', '.join(schools) if schools else school.name}\n"
        f"Order amount: GHS {procurement_order.total_amount}\n"
        f"Estimated girls population at target: {school.estimated_girls_population}\n"
    )

    if not settings.ANTHROPIC_API_KEY:
        return _fallback_narrative(stats_summary, total_units, school)

    prompt = (
        "Write a short (120-180 word), funder-ready impact narrative for a "
        "menstrual health NGO/CSR report, based ONLY on the data below. "
        "Be factual, warm but not exaggerated, and end with one sentence on "
        "why continued/expanded support matters. Do not invent any numbers "
        "not present in the data.\n\n" + stats_summary
    )

    try:
        resp = requests.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.ANTHROPIC_MODEL,
                "max_tokens": 400,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
        narrative = "\n".join(text_blocks).strip()
        return narrative or _fallback_narrative(stats_summary, total_units, school)
    except requests.RequestException:
        return _fallback_narrative(stats_summary, total_units, school)


def _fallback_narrative(stats_summary: str, total_units: int, school) -> str:
    return (
        f"Through this procurement, {total_units} verified reusable pad units were delivered to "
        f"{school.name} in {school.district} District. Each delivery was confirmed with photo and "
        f"GPS evidence by a local LaafiTech agent before being counted toward this report. "
        f"Continued support helps extend this verified distribution model to more schools facing "
        f"similar barriers to menstrual health access."
    )


# ---------------------------------------------------------------------------
# 3. Verification-assist: duplicate photo detection + anomaly flags
# ---------------------------------------------------------------------------

def hash_photo(photo_url: str) -> str:
    """
    Lightweight perceptual-style hash placeholder using the photo URL +
    content bytes. For production, swap to a real perceptual hash
    (e.g. imagehash.phash on the downloaded image) so visually-similar
    re-submissions are caught, not just byte-identical files.
    """
    try:
        resp = requests.get(photo_url, timeout=10)
        content = resp.content
    except requests.RequestException:
        content = photo_url.encode()
    return hashlib.sha256(content).hexdigest()


def flag_anomalous_distribution(record, photo_hash: str) -> tuple[list, Decimal]:
    """
    Runs cheap, explainable checks and returns (flags, anomaly_score).
    This is a *first pass* -- as real DistributionRecord history
    accumulates, the volume-anomaly check below can be upgraded from a
    simple multiple-of-average rule to a trained outlier model.
    """
    from distributions.models import DistributionRecord  # local import avoids circular import

    flags = []

    # Duplicate / reused photo check
    if DistributionRecord.objects.filter(photo_hash=photo_hash).exclude(id=record.id).exists():
        flags.append("DUPLICATE_PHOTO")

    # GPS plausibility: compare to agent's registered catchment home location
    agent = record.agent
    if agent.gps_home_lat is not None and agent.gps_home_lng is not None:
        distance_km = _haversine_km(
            float(agent.gps_home_lat), float(agent.gps_home_lng),
            float(record.gps_lat), float(record.gps_lng),
        )
        if distance_km > 50:  # threshold: flag distributions implausibly far from agent's base
            flags.append("GPS_FAR_FROM_CATCHMENT")

    # Volume anomaly: flag if this single record is a large multiple of the
    # agent's own historical average (catches suspicious spikes)
    past_qty = list(
        DistributionRecord.objects.filter(agent=agent, verification_status="verified")
        .exclude(id=record.id)
        .values_list("quantity", flat=True)
    )
    if past_qty:
        avg_qty = sum(past_qty) / len(past_qty)
        if avg_qty > 0 and record.quantity > avg_qty * 4:
            flags.append("VOLUME_SPIKE")

    # Score: simple weighted count -> normalized 0-1, capped
    score = min(Decimal(len(flags)) / Decimal(3), Decimal("1.0"))
    return flags, score


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


# ---------------------------------------------------------------------------
# 4. Menstrual health education assistant (Claude API, for USSD/SMS/WhatsApp)
# ---------------------------------------------------------------------------

EDUCATION_SYSTEM_PROMPT = (
    "You are a friendly, accurate menstrual health education assistant for "
    "girls and young women in rural Northern Ghana, accessed via SMS/USSD. "
    "Keep answers short (under 60 words, SMS-friendly), medically accurate, "
    "non-judgmental, and free of stigma or shame. If a question suggests a "
    "medical concern needing in-person care (e.g. severe pain, unusual "
    "bleeding), gently recommend visiting a nearby health center or CHPS "
    "compound rather than self-diagnosing."
)


# ---------------------------------------------------------------------------
# 5. In-app platform assistant (Claude API, web/mobile, all roles)
#
# Distinct from ask_education_assistant above: that one is a fixed-prompt
# SMS Q&A feature for end recipients. This one serves logged-in platform
# users (agent/funder/admin) and tailors both the system prompt and the
# injected context to the caller's role and *their own* data only -- it
# reuses the same ownership scoping as the REST endpoints so the assistant
# can never describe another funder's or agent's data.
# ---------------------------------------------------------------------------

PLATFORM_SYSTEM_PROMPTS = {
    "agent": (
        "You are the in-app assistant for a LaafiTech field agent using the "
        "distribution platform. Help with questions about their own "
        "deliveries, inventory, payouts, and how to use the app. Keep "
        "answers short and practical. You only know what's in the CONTEXT "
        "block below -- never invent figures. If asked about something "
        "outside that context, say you don't have that information and "
        "suggest checking with a LaafiTech admin."
    ),
    "funder": (
        "You are the in-app assistant for a LaafiTech funder/partner "
        "(NGO, CSR, or government program) using the impact dashboard. "
        "Help them understand their own procurement orders and verified "
        "impact data, and how to use the platform. You only know what's "
        "in the CONTEXT block below, which reflects only this funder's "
        "own orders -- never invent figures or reference other funders. "
        "If asked about something outside that context, say so plainly."
    ),
    "admin": (
        "You are the in-app assistant for a LaafiTech internal admin "
        "managing agents, verification, and payouts. Help with operational "
        "questions and how to use the platform. You only know what's in "
        "the CONTEXT block below -- never invent figures. If asked about "
        "something outside that context, say you don't have that "
        "information rather than guessing."
    ),
    "community_user": (
        "You are a friendly, accurate menstrual health education assistant "
        "for girls and young women in Northern Ghana, used in-app (not "
        "SMS, so you don't need to be terse -- give full, clear answers). "
        "Be medically accurate, non-judgmental, and free of stigma or "
        "shame. If a question suggests a medical concern needing "
        "in-person care (e.g. severe pain, unusual bleeding), gently "
        "recommend visiting a nearby health center or CHPS compound "
        "rather than self-diagnosing. This user has no operational data "
        "on the platform -- don't reference deliveries, payouts, or "
        "agents; just answer their question."
    ),
}
PLATFORM_SYSTEM_PROMPTS["superadmin"] = PLATFORM_SYSTEM_PROMPTS["admin"]


def _build_platform_context(user) -> str:
    """Builds a small, role-scoped data snapshot to ground the assistant's
    answers. Deliberately lightweight (counts/totals, not raw records) to
    keep the prompt small and avoid leaking unnecessary detail."""
    role = user.role

    if role == "agent":
        from agents.models import Agent

        agent = getattr(user, "agent_profile", None)
        if agent is None:
            return "No agent profile is linked to this account yet."
        return (
            f"Agent code: {agent.agent_code}\n"
            f"Catchment area: {agent.catchment_area}\n"
            f"Verification status: {agent.verification_status}\n"
            f"Current stock balance: {agent.current_inventory_balance} units\n"
            f"Lifetime distributed (verified): {agent.total_distributed_lifetime} units\n"
        )

    if role == "funder":
        from funders.models import FunderOrganization, ProcurementOrder

        try:
            funder = FunderOrganization.objects.get(user=user)
        except FunderOrganization.DoesNotExist:
            return "No funder organization profile is linked to this account yet."
        orders = ProcurementOrder.objects.filter(funder=funder)
        total_orders = orders.count()
        by_status = {}
        for o in orders.values_list("status", flat=True):
            by_status[o] = by_status.get(o, 0) + 1
        return (
            f"Funder organization: {funder.name}\n"
            f"Total procurement orders placed: {total_orders}\n"
            f"Orders by status: {by_status}\n"
        )

    if role in ("admin", "superadmin"):
        from distributions.models import DistributionRecord
        from payments.models import Payout

        pending_verification = DistributionRecord.objects.filter(verification_status="pending").count()
        pending_payouts = Payout.objects.filter(status="pending").count()
        return (
            f"Records pending verification: {pending_verification}\n"
            f"Payouts pending: {pending_payouts}\n"
        )

    if role == "community_user":
        # Deliberately minimal -- this role has no operational data to
        # scope, just a name so the assistant can greet them personally.
        return f"User's first name: {user.first_name or 'there'}\n"

    return "No context available for this account's role."


def ask_platform_assistant(user, conversation: list[dict]) -> str:
    """
    Multi-turn assistant for the in-app chat widget. `conversation` is a
    list of {"role": "user"|"assistant", "content": "..."} messages (the
    full visible thread, most recent last) -- the caller (the view) is
    responsible for trimming history length before calling this.
    """
    role = getattr(user, "role", None)
    system_prompt = PLATFORM_SYSTEM_PROMPTS.get(role)
    if system_prompt is None:
        return "This account's role doesn't have an assistant configured."

    if not settings.ANTHROPIC_API_KEY:
        return "The assistant isn't fully set up yet -- please contact a LaafiTech admin."

    context = _build_platform_context(user)
    full_system_prompt = f"{system_prompt}\n\nCONTEXT:\n{context}"

    messages = [{"role": m["role"], "content": m["content"]} for m in conversation if m.get("content")]
    if not messages:
        return "Ask me a question to get started."

    try:
        resp = requests.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.ANTHROPIC_MODEL,
                "max_tokens": 400,
                "system": full_system_prompt,
                "messages": messages,
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
        return "\n".join(text_blocks).strip() or "Sorry, please try asking again."
    except requests.RequestException:
        return "Sorry, the assistant is temporarily unavailable. Please try again shortly."


def ask_education_assistant(question: str) -> str:
    """Single-turn Q&A for the USSD/SMS education feature. Each message is
    stateless by design to keep USSD session handling simple."""
    if not settings.ANTHROPIC_API_KEY:
        return (
            "Thanks for your question. Our education assistant isn't fully "
            "set up yet -- please ask your local LaafiTech agent or visit "
            "the nearest CHPS compound."
        )
    try:
        resp = requests.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.ANTHROPIC_MODEL,
                "max_tokens": 150,
                "system": EDUCATION_SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": question}],
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
        return "\n".join(text_blocks).strip() or "Sorry, please try asking again."
    except requests.RequestException:
        return "Sorry, our assistant is temporarily unavailable. Please ask your local LaafiTech agent."
