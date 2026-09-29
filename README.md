# ClearSend — West Africa FX + fee transparency (demo)

**ClearSend** is a pitch / product demo for **MoMo Fintech Labs**: all-in FX and fee transparency across West Africa corridors (**NGN**, **GHS**, **CFA/XOF**), with ranked quote paths, authenticated dashboard, and a **sandbox send-money** flow wired for MTN MoMo Open API.

> **This is a demo.** Quotes are synthetic, timestamped **DEMO**, and not live market data. ClearSend does **not** claim live PAPSS connectivity and does **not** hold funds. Transfers use **SandboxMockProvider** unless real MoMo keys are configured — never treat sandbox stubs as live settlement.

## What it shows

1. **Landing** — problem / solution framing + Login / Get started  
2. **Auth** — email/password signup & login via **Supabase Auth**  
3. **Dashboard** — DEMO balances, recent transfers, Send / Transfers / Settings  
4. **Send flow** — corridor picker → amount + MoMo MSISDN → all-in quote review → confirm → receipt  
5. **MoMo layer** — Collection + Disbursement interfaces with mock + real hook points  
6. **Quote engine** — ranked DEMO paths (NGN↔GHS, GHS↔XOF, etc.)

## Demo limits (read this)

- Quotes are **indicative DEMO only**.
- **No live PAPSS**, and **no live MoMo settlement** unless you supply approved sandbox/production keys.
- Without MoMo env keys, payouts are simulated (`sandbox_completed`) with latency + idempotency.
- **No fund holding**, custody, or full KYC — demo auth only.
- FX mids and fee models in `src/lib/quotes.ts` are hardcoded for storytelling.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4  
- **Supabase Auth** + **Supabase Postgres** (`profiles`, `transfers` with RLS)  
- `@supabase/ssr` cookie session refresh via middleware  
- MTN MoMo client stubs under `src/lib/momo/`  
- Node.js **22+** recommended (`@supabase/supabase-js` engine requirement)

## Run locally

```bash
cp .env.example .env
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. **Get started** → create an account (profile row is created by a Supabase trigger from `user_metadata.name`)  
2. Open **Send** → pick a corridor, amount, recipient MSISDN (e.g. `+233241234567`)  
3. Confirm → see receipt with status `sandbox_completed`  
4. Check **Transfers** and **Overview**

If **Confirm email** is enabled in Supabase Auth, signup will ask you to confirm before a session is issued. For a frictionless local demo, turn off **Confirm email** under Authentication → Providers → Email.

### Production build

```bash
npm install
npm run build
npm start
```

## Environment variables

See **`.env.example`** for the full list.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon / publishable key (RLS-enforced) |
| `MOMO_API_USER` | MoMo | API user UUID from MoMo Developer portal |
| `MOMO_API_KEY` | MoMo | API key for that user |
| `MOMO_SUBSCRIPTION_KEY` | MoMo | Primary subscription key (Collection/Disbursement product) |
| `MOMO_TARGET_ENV` | MoMo | `sandbox` (default) or `production` |
| `MOMO_CALLBACK_URL` | Optional | Async callback URL for MoMo |
| `MOMO_BASE_URL` | Optional | Override API host |

If MoMo keys are **missing**, `getMomoClient()` returns **SandboxMockProvider**.

`AUTH_SECRET` / `DATABASE_URL` / Prisma are **no longer used**.

### Vercel

Set these project env vars (Production + Preview as needed):

- `NEXT_PUBLIC_SUPABASE_URL` = `https://drdxmfshvjpaurocwfgy.supabase.co` (or your project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

In **Supabase → Authentication → URL configuration**:

| Setting | Values |
|---------|--------|
| **Site URL** | `https://clearsend-eight.vercel.app` |
| **Redirect URLs** | `https://clearsend-eight.vercel.app/**`, `https://clearsend-eight.vercel.app/auth/callback`, `http://localhost:3000/**`, `http://localhost:3000/auth/callback` |

## Auth

- **Provider:** Supabase Auth email + password (`signUp` / `signInWithPassword` / `signOut`).  
- **Pages:** `/login`, `/signup`; `/dashboard/*` protected by middleware session refresh.  
- **Callback:** `/auth/callback` exchanges the email-confirm / PKCE code for a session.  
- **Storage:** `auth.users` + `public.profiles` (trigger on signup copies `name` from metadata).  
- **Data:** `public.transfers` queried with the user session (RLS).  

## Sandbox vs live MoMo

| Mode | When | Behaviour |
|------|------|-----------|
| **Sandbox stub** | Any of `MOMO_API_USER` / `MOMO_API_KEY` / `MOMO_SUBSCRIPTION_KEY` missing | `SandboxMockProvider` simulates Collection/Disbursement with ~0.4–1.2s latency and idempotency keys. Status → `sandbox_completed` or `failed`. |
| **MoMo API** | All three keys set | `RealMtnMomoProvider` calls MTN Open API token + requesttopay / transfer endpoints. Still respect `MOMO_TARGET_ENV`. |

**UI always banners DEMO/sandbox** when using the mock. Do not claim live settlement without keys and product approval.

### How to get MTN MoMo sandbox keys

1. Create an account at the [MoMo Developer portal](https://momodeveloper.mtn.com/).  
2. Subscribe to **Collection** and/or **Disbursement** (sandbox) products — note the **Primary Key** → `MOMO_SUBSCRIPTION_KEY`.  
3. Create an **API User** (`POST /v1_0/apiuser` with `X-Reference-Id` UUID) → `MOMO_API_USER`.  
4. Create an **API Key** for that user (`POST /v1_0/apiuser/{id}/apikey`) → `MOMO_API_KEY`.  
5. Obtain OAuth tokens via `/collection/token/` or `/disbursement/token/` (Basic auth = user:key).  
6. **Ghana Remittance** is partner-gated — contact MTN for access; Collection/Disbursement sandbox is typically available for Ghana/Zambia variants on the portal.  
7. Set `MOMO_TARGET_ENV=sandbox` and optional `MOMO_CALLBACK_URL`.

Code entry points: `src/lib/momo/` (`index.ts`, `mock.ts`, `real.ts`, `types.ts`).

## Project layout

```
src/
  app/                 # App Router (landing, auth, dashboard, APIs)
  components/          # Landing + dashboard UI
  lib/
    quotes.ts          # DEMO quote engine
    corridors.ts
    momo/              # MoMo Collection + Disbursement clients
    transfers.ts       # Create/execute transfer records (Supabase)
    auth.ts            # Current user helper
    supabase/          # Browser + server + middleware clients
  middleware.ts        # Protect /dashboard/* + refresh session
```

## Product notes for pitches

- Position ClearSend as **transparency + ranking + sandbox remittance UX**, not a licensed wallet.  
- Emphasize **PAPSS-aligned** regional clearing *intent* without claiming live PAPSS.  
- Highlight **MoMo soft handoff / disbursement stubs** after a clear all-in quote.

---

© ClearSend · Demo for MoMo Fintech Labs stakeholders
