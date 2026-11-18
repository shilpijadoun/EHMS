# EHMS — Hotel Palace

Single-hotel management MVP using React/Vite, Express and MongoDB. Public room discovery and reservations connect to the same database as the staff workspace.

## Implemented

- HttpOnly cookie login/logout, eight-hour sessions, server-side admin/manager/staff permissions, profile updates and password changes that invalidate sessions.
- Room creation/editing/deactivation, images, capacity, prices, amenities and date availability.
- Guest records, confirmed reservations, server-calculated totals, tax snapshots and cancellation.
- Transactional overlap protection: concurrent requests for the same room cannot both reserve overlapping dates.
- ID verification at check-in, payment and refund recording, additional charges, printable invoices and balance validation at checkout.
- Checkout creates a cleaning task. Completing all room tasks makes the room available again.
- Housekeeping assignment, team administration, administrator-assisted password resets, hotel settings and live operational totals.

## Run with your own persistent database

Use Node.js 22.12+ or 24+. MongoDB must be a **replica set** (including Atlas); transactions intentionally fail on a standalone MongoDB server. Use an existing replica set or initialize a local single-node replica set before starting.

In `backend`:

```powershell
npm.cmd install
Copy-Item .env.example .env
# Edit .env: set MONGO_URI, ADMIN_EMAIL and a strong ADMIN_PASSWORD (10–72 bytes).
npm.cmd run seed
npm.cmd start
```

Seed creates the first administrator only if no admin exists. It inserts three starter rooms without overwriting existing rooms. Remove ADMIN_PASSWORD from .env after setup. Sign in with the credentials you supplied.

In a second terminal, in `client`:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:5173. The Vite development proxy forwards `/api` to `127.0.0.1:5000`. Use `localhost:5173` consistently; `CLIENT_ORIGIN` defaults to that origin. If port 5173 is already occupied, run `npm.cmd run dev -- --port 5175` and set `CLIENT_ORIGIN=http://localhost:5175` in the backend environment before starting it.

## Try an isolated demo

```powershell
# Terminal 1, backend:
npm.cmd run demo
# Terminal 2, client:
npm.cmd run dev
```

Demo downloads a MongoDB executable on its first run, starts an isolated replica set and prints a randomly generated administrator password. It does not use `.env` or your persistent database. **Demo data is temporary and is deleted when stopped.** Use the persistent setup for real hotel records.

If port 5000 is already used, start the demo with `$env:PORT=5001; npm.cmd run demo`, then start the client with `$env:EHMS_API_TARGET='http://127.0.0.1:5001'; npm.cmd run dev -- --port 5175`.

## Daily workflow

1. Configure hotel contact information and tax rate in Hotel settings.
2. Add rooms and team accounts. Admin can manage all accounts; managers manage hotel operations; staff operate reception and housekeeping.
3. Create a reservation from the public booking page (also linked from the workspace).
4. In Reservations, open Manage / invoice. Verify guest ID and check in during the booked stay.
5. Record funds actually received, including method and external reference. Add extra charges as needed.
6. Collect the full balance, check out, then complete the generated housekeeping task.
7. To cancel a paid upcoming reservation, record the actual refund with a manager/admin account before cancellation.

Forgotten staff passwords can be reset by an administrator in Team. For a forgotten administrator password, set ADMIN_EMAIL and ADMIN_PASSWORD in the backend environment and run `npm.cmd run reset-admin`; remove the password from .env afterward. Email password recovery is not configured. Accounts are created by administrators; there is no public staff signup.

## Razorpay online payments

Online checkout is enabled only after these variables are set in `backend/.env`:

```dotenv
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=choose-a-separate-random-webhook-secret
```

Use test keys first. In Razorpay Dashboard, register an HTTPS webhook at `https://YOUR_DOMAIN/api/webhooks/razorpay`, configure the same webhook secret, and subscribe to `payment.captured`. Checkout creates the Razorpay order only after the reservation is saved. The server verifies the Checkout signature, fetches the payment from Razorpay, requires a captured INR payment for the exact booking balance, and also processes the signed webhook. Duplicate webhook deliveries are ignored.

Do not expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in the client, Git repository, browser environment variables, or support messages. The client receives only `RAZORPAY_KEY_ID`. A successful payment is credited only after server verification. The existing manual refund action deliberately rejects bookings containing Razorpay payments; issue those refunds in Razorpay until a dedicated gateway-refund workflow is added.

## Checks

```powershell
cd backend
npm.cmd test
cd ../client
npm.cmd run lint
npm.cmd run build
```

Integration tests use an isolated MongoDB replica set, never your configured database. They cover authorization, concurrent booking conflicts, rollback, check-in dates/ID checks, payments, checkout, housekeeping and session invalidation.

## Deployment and scope

This repository is a local MVP, not a deployed service. Serve `client/dist` with SPA fallback and proxy `/api` to the backend on the same HTTPS origin. Set `NODE_ENV=production`, `CLIENT_ORIGIN` to that origin, and `MONGO_URI` to your replica set. Keep the backend behind the reverse proxy; it binds to loopback by default. Configure backups, TLS, external monitoring and deployment secrets for your environment.

Razorpay checkout can collect online payments after the credentials and webhook are configured. Other payment methods record money already received; no other gateway charges or bank transfers are initiated. Email/SMS notifications, automated email recovery, multi-hotel tenancy, review accounts, service ordering and advanced accounting exports are outside this MVP. Net receipts and outstanding totals are operational summaries, not statutory accounts. Rates and amounts are INR; operational day boundaries use `HOTEL_TIMEZONE` (default `Asia/Kolkata`). Review configured tax rates before use.

Active application entry: `client/src/HotelApp.jsx`; API: `backend/app.js`. Older prototype screens remain in the repository for reference but are not routed by the active app.
