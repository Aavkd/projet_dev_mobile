# Click & Collect Mobile (Expo)

This folder contains the Expo Go mobile app scaffold for Android/iOS while keeping the existing Vite web app intact.

## 1) Install dependencies

From repo root:

```bash
npm --prefix mobile install
```

## 2) Configure environment

1. Copy `mobile/.env.example` to `mobile/.env`.
2. Fill all `EXPO_PUBLIC_APPWRITE_*` values with your Appwrite IDs.

You can reuse values from root `.env` by renaming `VITE_*` keys to `EXPO_PUBLIC_*` keys.

## 3) Start with Expo Go

From repo root:

```bash
npm run dev:mobile
```

Then scan the QR code with Expo Go on your Android phone.

## Available root scripts

- `npm run dev:web` -> starts existing Vite web app.
- `npm run dev:mobile` -> starts Expo mobile app.
- `npm run android` -> starts Expo and opens Android target.

## Current status (March 2026)

- Expo Go connection is working on Android (SDK 54).
- App boot and routing shell are working.
- Merchant login and merchant shell screen are reachable.
- Client login path is not stable yet.

## Known issues

1. `Creation of a session is prohibited when a session is active.` appears when switching account sessions.
2. Auth flow currently does not handle role/account switching safely on mobile.
3. Feature screens are still placeholders; only auth and shell routes are implemented.

## Remaining implementation roadmap

1. **Auth/session hardening**
	- Detect active Appwrite session before login/register.
	- If switching user, call `account.deleteSession('current')` before creating a new session.
	- Add a dedicated "Switch account" action and clear local auth state reliably.
	- Validate merchant -> logout -> client login and client -> logout -> merchant login flows.

2. **Client feature port (full parity target)**
	- Port `catalog`, `product detail`, `cart`, `pickup addresses`, `orders`, `order confirmation` pages.
	- Replace web storage patterns with AsyncStorage/SecureStore adapters where needed.

3. **Merchant feature port (full parity target)**
	- Port `dashboard`, `product list/form`, `category management`, `order queue`, `order history`, `opening hours`.
	- Port product image upload flow using Expo Image Picker + File System.

4. **Realtime and notifications**
	- Port mobile notification bell/list and in-app toast pattern.
	- Validate Appwrite realtime channels on physical Android device.

5. **Verification and stabilization**
	- Run end-to-end client and merchant journeys on phone.
	- Confirm env consistency between root `.env` and `mobile/.env`.
	- Add final troubleshooting notes for Expo Go and Appwrite auth/session behavior.
