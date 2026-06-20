# LaafiTech Web — Admin + Funder (unified)

One React/Vite app serving both LaafiTech staff (Admin) and funding
partners (Funder), with role-based sign-up, sign-in, and routing.

- `/login`, `/signup` — shared auth screens. Sign-up lets a new user choose
  **Funder** or **LaafiTech Admin**; the backend issues a token and the
  user's `role` decides where they land.
- `/admin/*` — verification queue, agents, inventory, payouts, schools.
  Only `admin` / `superadmin` roles can reach these routes.
- `/funder/*` — impact overview, verified deliveries, procurement, orders.
  Only `funder` role can reach these routes.
- `PrivateRoute` in `App.jsx` enforces the role gate; an authenticated user
  hitting the wrong section is redirected to their own home (`/`).

## Local setup
```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev
```

## Note on Admin sign-up

The sign-up form currently allows self-registration as **Admin**, same as
Funder. That's convenient for early team onboarding but should be locked
down before this is in front of real funders/payouts — e.g. require an
invite token for the `admin` role, or remove it from the public sign-up
form and create admin accounts via Django admin / `createsuperuser`
instead.
