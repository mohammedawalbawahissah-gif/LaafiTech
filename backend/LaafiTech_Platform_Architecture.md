# LaafiTech Platform — Technical Architecture & Build Plan

**Prepared by:** Wolbi Technologies for LaafiTech
**Date:** June 2026

---

## 1. System Purpose

LaafiTech manufactures reusable menstrual pads. This platform is the **distribution, agent management, and impact verification layer** that connects manufacturing to (a) sustainable local sales/distribution and (b) verifiable funding from NGOs, CSR partners, and government health programs.

Three connected surfaces, one shared backend:

| Surface | Users | Core Job |
|---|---|---|
| **Agent App** (Android + iOS) | CHWs, teachers, market women, distribution agents | Log distributions, manage stock, get paid |
| **Funder Dashboard** (Web) | NGOs, CSR partners, government | See verified impact, procure deliveries, pay LaafiTech |
| **Admin Console** (Web) | LaafiTech ops team | Manage agents, inventory, verification, payouts, reporting |

---

## 2. Data Model

### Core Entities

**User** (shared auth across all roles)
- id, full_name, phone_number, email, role (`agent`, `funder`, `admin`, `superadmin`), region/district, status (active/suspended), date_joined

**Agent** (extends User)
- agent_code (unique), community/catchment_area, gps_home_location, verification_status (pending/verified), current_inventory_balance, total_distributed_lifetime, mobile_money_number, momo_provider (MTN/Vodafone/AirtelTigo), payout_method (`native_momo` / `hubtel`)

**InventoryBatch**
- batch_id, production_date, quantity_produced, unit_cost, allocated_to (Admin/Agent), status (`in_production`, `allocated`, `distributed`, `depleted`)

**AgentInventoryAllocation**
- agent, batch, quantity_allocated, quantity_remaining, allocation_date, restock_requested (bool)

**DistributionRecord** *(the atomic unit — both a sale AND an impact data point)*
- id, agent (FK), recipient_type (`individual`, `school`, `community_group`), school_or_community (FK, nullable), quantity, unit_price (0 if subsidized/free), payment_type (`cash`, `momo`, `subsidized`, `free`), gps_lat, gps_lng, photo_url (Cloudinary), timestamp, verification_status (`pending`, `verified`, `flagged`), verified_by (Admin FK), notes

**School / Community**
- name, district, region, gps_location, contact_person, estimated_girls_population, partner_organization (nullable)

**FunderOrganization**
- name, type (`NGO`, `corporate_csr`, `government`, `individual_donor`), contact_person, email, verification_status

**ProcurementOrder** *(funder "buys" verified deliveries)*
- id, funder (FK), target_school_or_district, quantity_requested, unit_price, total_amount, status (`pending_payment`, `paid`, `fulfilling`, `completed`), linked_distribution_records (M2M), payment_reference

**Payout**
- agent (FK), amount, method (`native_momo`/`hubtel`), provider_reference, status (`pending`, `processing`, `completed`, `failed`), period_covered, initiated_by

**ImpactReport** (auto-generated, cached for performance)
- scope (school/district/national), period, girls_reached_count, pads_distributed_count, schools_covered_count, total_funder_contribution, cost_per_girl

---

## 3. Screens by Surface

### A. Agent App (React Native / Expo — Android + iOS, one codebase)
1. Login/OTP (phone-based)
2. Home — current inventory balance, today's distributions, earnings summary
3. **Log Distribution** — recipient type, quantity, GPS auto-capture, photo capture, payment type
4. My Inventory — current stock, restock request button
5. My Earnings — running ledger, payout history, pending payout status
6. Distribution History — list/map view of past logs, verification status badges
7. Profile/Settings — payout method selection (Native MoMo vs Hubtel), MoMo number, sync status (for offline-first queuing in low-network areas)

### B. Funder Dashboard (React Web)
1. Login
2. Impact Overview — live map + stats (girls reached, schools covered, pads delivered)
3. Browse Verified Deliveries — filter by district/school/date, drill into photo+GPS+timestamp evidence
4. **Procure Deliveries** — select school/district + quantity → checkout (Hubtel payment)
5. My Procurement History — past orders, fulfillment status, downloadable impact reports (PDF)
6. Auto-Generated Reports — shareable summary for the funder's own stakeholders

### C. Admin Console (React Web)
1. Dashboard — pending verifications, low-inventory alerts, pending payouts
2. Agent Management — onboard/verify/suspend agents, view performance
3. Inventory Management — log new production batches, allocate to agents
4. **Verification Queue** — review flagged/pending DistributionRecords (photo+GPS check) before they count toward funder-visible impact
5. Payout Management — initiate/reconcile agent payouts (Native MoMo + Hubtel)
6. Procurement Management — track incoming funder orders, mark fulfillment
7. Reports & Analytics — system-wide impact metrics, cost-per-girl, regional breakdowns

---

## 4. Payment Architecture — Native MoMo + Hubtel

Two payment rails, used for two different directions of money flow:

### Outbound: Agent Payouts
- **Primary: Native MTN MoMo Disbursement API** — direct, lower fees, fastest for MTN numbers (majority of rural Ghana)
- **Fallback/Alternate: Hubtel Send Money API** — covers payouts to Vodafone Cash and AirtelTigo Money agents, since Hubtel aggregates all three networks. Agents pick their network at registration; system routes automatically.

### Inbound: Funder Procurement Payments
- **Primary: Hubtel Checkout/Payment API** — supports MoMo (all networks), cards, and bank transfer in one integration. Better fit here since funders (NGOs/corporates) may pay by card or bank transfer, not just MoMo.
- Native MTN MoMo Collections API can run in parallel as a direct option for funders who specifically want to pay via MTN MoMo Merchant.

### Routing logic (backend)
```
Payout(agent):
  if agent.momo_provider == "MTN":
      try Native MoMo Disbursement API
      on failure → fallback to Hubtel Send Money
  else:  # Vodafone, AirtelTigo
      use Hubtel Send Money API

Payment(funder, order):
  default → Hubtel Checkout (MoMo/card/bank)
  optional → Native MTN MoMo Collections (if funder selects "Pay with MTN MoMo" directly)
```

All payment events (success/failure/webhook callbacks) write to a `PaymentTransaction` log table for reconciliation and audit — important for funder trust.

---

## 5. Tech Stack

- **Backend:** Django REST Framework (consistent with NeomatCare/FarmaSyst — reuse role-based permission patterns, auth)
- **Agent App:** React Native + Expo (Android + iOS, single codebase), offline-first local queue for low-connectivity distribution logging
- **Web Dashboards:** React/Vite
- **Payments:** MTN MoMo API (direct) + Hubtel API (aggregator/fallback + funder checkout)
- **Media:** Cloudinary (distribution photos)
- **Notifications/Email:** Resend
- **Hosting:** Railway (backend/PostgreSQL), Vercel (web frontends) — same as your current Wolbi setup

---

## 6. Build Sequence (all phases, built together as agreed)

Even building everything in parallel, the backend should be built **data-model-first** so the three frontends don't block each other:

1. **Week 1-2:** Backend core — User/Agent/Inventory/DistributionRecord models, auth, role permissions
2. **Week 2-4 (parallel):** Agent app distribution logging + Admin verification queue (these two must ship together — verification has nothing to verify without logging)
3. **Week 3-5 (parallel):** Payment integration — MoMo + Hubtel payout flow for agents
4. **Week 4-6 (parallel):** Funder dashboard — impact browsing, procurement, Hubtel checkout
5. **Week 5-6:** Reporting/analytics layer, polish, QA across all three apps

---

## 7. AI Integration

This is what makes the platform's funder/grant story compelling — not "AI" as a buzzword, but specific, explainable features that improve the two things funders and grant bodies actually care about: **targeting the right need** and **proving the impact happened**.

### 7.1 Need-Priority Scoring (explainable, not a black box)
Ranks schools/communities by urgency using a transparent weighted model: poverty index (district-level GSS data), distance from nearest market/sanitary product source, historical absenteeism data where available, and population of girls 10–19. Output: a priority score + the factors behind it, shown to both Admin (where to send agents first) and Funders (why this school over another). Grant reviewers specifically reward **explainable** targeting over opaque ML — start rule-based and weighted, evolve to a trained model once enough DistributionRecord + outcome data exists to validate it.

### 7.2 AI-Generated Impact Narratives
Funders don't just want numbers — they want a readable story for their own stakeholders/board. Using the Claude API, the system turns structured data (girls reached, schools covered, before/after attendance where tracked) into a funder-ready narrative report, auto-attached to every completed ProcurementOrder. This is a genuine differentiator: competitors hand over spreadsheets, you hand over a report.

### 7.3 Verification-Assist (fraud/anomaly flagging)
Since payouts are held for manual verification, AI should make that human review faster and sharper, not replace it:
- Duplicate/reused photo detection (perceptual hashing) — flags agents submitting the same photo across multiple "distributions"
- GPS plausibility checks (flag if claimed distribution location is implausibly far from agent's registered catchment area or from any known school/community)
- Pattern anomaly flags (unusual spikes in one agent's volume vs. their own history)
Flagged records get a priority/warning badge in the Admin verification queue — the admin still makes the final call, which matters for your "held until verified" policy and for funder trust.

### 7.4 Menstrual Health Education Assistant
A Claude-powered Q&A assistant accessible via USSD/SMS (and WhatsApp later) that answers girls' questions about menstrual health in plain language — directly addressing the knowledge gap the Kumbungu research documented (53.6% poor menstrual knowledge). This also closes the loop on the *original* LaafiTech idea (education/awareness) without it being the whole business model.

### 7.5 Why this matters for grants/competitive positioning
Grant bodies and impact investors increasingly want to see: (1) data-driven targeting instead of guesswork, (2) verifiable, hard-to-fake proof of delivery, and (3) cost-efficiency at scale. Sections 7.1–7.3 directly answer all three, with 7.2 packaging that proof into something a grant reviewer or board member actually reads. This is a stronger, more defensible "AI" story than the original deck's "AI automated campaigns" because every feature here ties to a specific, auditable data flow — not a vague automation claim.

## 8. Decisions Locked

- **Mobile money providers:** Mixed support built from day one (MTN native + Hubtel for Vodafone Cash/AirtelTigo) — saves a costly retrofit later
- **Payout timing:** Held until admin verifies photo+GPS evidence — protects funder trust, which is the core asset of this platform
- **Pilot district: Kumbungu District, Northern Region.** Selected based on (a) proximity to Tamale for tight field-iteration loops during MVP testing, (b) existing peer-reviewed research documenting acute menstrual hygiene knowledge gaps and lack of sanitation infrastructure in the district, and (c) right-sized scale for a first pilot. Savannah and North East regions show higher raw poverty rates and are strong **Phase 3 expansion** candidates once the model is validated.
