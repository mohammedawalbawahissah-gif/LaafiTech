# LaafiTech Agent App

React Native (Expo) app for LaafiTech distribution agents — Android and iOS
from one codebase. This is the data-entry point of the whole platform: every
distribution logged here flows into the Admin verification queue and, once
approved, the Funder dashboard's impact reports.

## Local setup

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_BASE_URL to your backend
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) for fastest iteration, or run
`npx expo run:android` / `npx expo run:ios` for a full native build.

## Screens

| Screen | Purpose |
|---|---|
| Login | Phone number + password (swap for OTP in production) |
| Home | Stock balance, today's logs, lifetime distributed, quick actions |
| Log Distribution | Recipient type, quantity, payment type, **GPS capture**, **photo capture** — submits to the backend, which runs AI verification-assist automatically |
| History | Past distribution logs with verification status + any AI flags |
| Inventory | Current allocation balance, restock request |
| Earnings | Pending vs. paid payout totals, payout history |
| Profile | Agent details, mobile money network selection (drives MoMo/Hubtel payout routing on the backend), logout |

## Notes for the next build pass

- **Photo upload**: `uploadPhoto()` in `LogDistributionScreen.jsx` currently
  returns the local device URI as a placeholder. Replace with a real
  Cloudinary unsigned upload (matching `CLOUDINARY_URL` on the backend)
  before this goes to agents in the field.
- **Auth**: phone+password works for now; OTP-based login is a better fit
  for low-literacy/shared-phone contexts — flagged in the architecture doc.
- **Offline queue**: not yet implemented. Given rural network conditions,
  distribution logs should queue locally (e.g. via AsyncStorage) and sync
  when connectivity returns, rather than failing silently on submit.
- App icons in `/assets` are solid-color placeholders — swap for real
  LaafiTech branding assets before building for app stores.
