# LaafiTech Platform — Backend

Django REST Framework backend for the LaafiTech distribution, agent
management, funder procurement, payment, and AI verification/impact system.

See `LaafiTech_Platform_Architecture.md` (provided separately) for the full
system design, data model rationale, and AI integration details.

## Local setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## App structure

| App | Responsibility |
|---|---|
| `accounts` | Custom User model (role-based: agent/funder/admin/superadmin), auth |
| `agents` | Agent profiles, inventory allocations, payout-method routing |
| `inventory` | Production batches from LaafiTech manufacturing |
| `distributions` | Schools, DistributionRecord (sale + impact data point), verification queue |
| `funders` | Funder orgs, ProcurementOrder (verified-delivery procurement, not generic donation) |
| `payments` | Payout + PaymentTransaction models, MTN MoMo + Hubtel routing logic |
| `ai_services` | Need-priority scoring, AI impact narratives, verification-assist, education assistant |
| `reports` | Cached ImpactReport snapshots |

## Key flows

1. **Agent logs a distribution** -> AI verification-assist runs automatically
   (duplicate photo check, GPS plausibility, volume anomaly) -> record sits
   in `pending` with any AI flags attached.
2. **Admin reviews verification queue** (`/api/distributions/verification-queue/`)
   -> AI-flagged records surface first -> admin approves/rejects
   (`/api/distributions/{id}/verify/`).
3. **Payout only created/processed for verified records** -> routed to
   native MTN MoMo (MTN agents) or Hubtel (Vodafone/AirtelTigo agents, with
   Hubtel as MTN fallback too) via `payments.services.process_agent_payout`.
4. **Funder procures verified deliveries** to a target school -> pays via
   Hubtel Checkout -> on completion, AI generates a funder-ready impact
   narrative (`/api/procurement-orders/{id}/generate-report/`).

## Deployment

Matches the existing Wolbi stack: Railway (backend + PostgreSQL), Cloudinary
(media), Resend (email). Set all `.env` values as Railway environment
variables before deploying.
