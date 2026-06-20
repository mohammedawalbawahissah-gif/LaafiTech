# LaafiTech Platform — Backend

Django REST Framework backend for the LaafiTech distribution, agent
management, funder procurement, payment, and AI verification/impact system.

See `LaafiTech_Platform_Architecture.md` (provided separately) for the full
system design, data model rationale, and AI integration details.

## Local setup

Uses Postgres by default (matches Railway production). One-time setup:

1. Install Postgres:
   - Windows: `winget install PostgreSQL.PostgreSQL` (or the installer from
     postgresql.org) — note the password you set for the `postgres` user
     during setup; you'll need it once, below.
   - Mac: `brew install postgresql@16 && brew services start postgresql@16`
2. Create a dedicated `laafitech_admin` role and database (don't run the
   app against the `postgres` superuser role):
   ```powershell
   psql -U postgres -c "CREATE ROLE laafitech_admin WITH LOGIN PASSWORD 'choose-a-password' CREATEDB;"
   psql -U postgres -c "CREATE DATABASE laafitech OWNER laafitech_admin;"
   ```
   (enter the `postgres` user's password when prompted for each command)

Then:
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # set DB_PASSWORD to the password you chose above
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

No local Postgres install? Set `DB_ENGINE=sqlite` in `.env` instead —
`migrate` then works with zero database setup (good for a quick spin-up,
not for testing things that depend on Postgres-specific behavior).

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
