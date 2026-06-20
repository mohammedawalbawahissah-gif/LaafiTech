# LaafiTech Platform

Tech-enablement layer for LaafiTech's reusable menstrual pad manufacturing
venture — agent-based distribution, verified impact data, and funder
procurement, built on top of LaafiTech's existing production and supply.

Pilot district: **Kumbungu, Northern Region, Ghana.**

See [`backend/LaafiTech_Platform_Architecture.md`](backend/LaafiTech_Platform_Architecture.md)
for the full system design and AI integration rationale.

## Repo structure

```
laafitech/
├── backend/    # Django REST Framework API (accounts, agents, inventory,
│               # distributions, funders, payments, ai_services, reports)
├── frontend/
│   └── web/    # React/Vite — ONE app for both LaafiTech Admin and Funder
│               # roles, with role-based sign-up/sign-in and routing
│               # (/admin/* vs /funder/*)
└── mobile/     # React Native (Expo) — agent app, Android + iOS
```

All three surfaces share one Django REST API and one design system
(Fraunces / Inter / IBM Plex Mono, teal/terracotta/cream tokens).

## Quick start

### Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in DB + Cloudinary + payment creds
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend — Web (Admin + Funder, unified)
```bash
cd frontend/web
npm install
cp .env.example .env          # set VITE_API_BASE_URL
npm run dev
```
Visiting `/signup` lets a new user pick **Funder** or **LaafiTech Admin**;
after sign-in/sign-up, the user's role decides whether they land on
`/admin` or `/funder`. See `frontend/web/README.md` for a note on locking
down public Admin sign-up before going live with real funders/payouts.

### Mobile — Agent App (Expo)
```bash
cd mobile
npm install
cp .env.example .env          # set EXPO_PUBLIC_API_BASE_URL
npx expo start
```
Scan the QR code with Expo Go (Android/iOS) for device testing, or press
`a` / `i` for an emulator/simulator.

## Status

- Backend: migrations validated across all 8 apps, system checks pass.
- Web app (Admin + Funder, unified): `npm run build` verified clean,
  role-based sign-up/sign-in and route gating in place.
- Agent mobile app: dependencies installed, `expo-doctor` passes 19/21
  checks (the 2 failures are external network/schema lookups unavailable
  in this build environment, not project issues).
- **Not yet done:** end-to-end integration test of web + mobile against a
  live backend instance running together.

## Deployment target

Railway (backend + PostgreSQL), Cloudinary (media), MTN MoMo + Hubtel
(payments) — matching the existing Wolbi/NeoMatCare deployment pattern.
