# ClearSend — West Africa FX + fee transparency

**ClearSend** is a production-oriented app for **MoMo API** corridors: all-in FX and fee transparency across West Africa (**NGN**, **GHS**, **CFA/XOF**), with ranked quote paths, authenticated dashboard, and a send-money flow wired for the MTN MoMo Open API.

> ClearSend does **not** claim live PAPSS connectivity and does **not** hold funds. Quotes are **estimated** all-in amounts from the quote model until a live FX feed is connected. MoMo uses **SandboxMockProvider** when keys are missing or `MOMO_TARGET_ENV=sandbox`; set live keys and `MOMO_TARGET_ENV=production` for the real MoMo provider.

## What it includes

1. **Landing** — problem / solution framing + Login / Get started  
2. **Auth** — email/password signup & login via **Supabase Auth**  
3. **Dashboard** — corridor balances (display only), recent transfers, Send / Transfers / Settings  
4. **Send flow** — corridor picker → amount + MoMo MSISDN → all-in quote review → confirm → receipt  
5. **MoMo layer** — Collection + Disbursement interfaces with sandbox mock + production provider  
6. **Quote engine** — ranked estimated paths (NGN↔GHS, GHS↔XOF, etc.)

## Product notes

- Quotes are **estimated** (model-based) until a live FX feed exists.  
- **No live PAPSS** connectivity is claimed; narratives are PAPSS-aligned only.  
- ClearSend does **not** hold funds, provide custody, or act as a licensed MTO.  
- Without MoMo production keys + `MOMO_TARGET_ENV=production`, payouts use `SandboxMockProvider` (`sandbox_completed`) with latency + idempotency.  
- FX mids and fee models live in `src/lib/quotes.ts`.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4  
- **Supabase Auth** + **Supabase Postgres** (`profiles`, `transfers` with RLS)  
- `@supabase/ssr` cookie session refresh via middleware  
- MTN MoMo client under `src/lib/momo/`  
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
3. Confirm → see receipt (sandbox status when not on production MoMo)  
4. Check **Transfers** and **Overview**

If **Confirm email** is enabled in Supabase Auth, signup will ask you to confirm before a session is issued. For frictionless local development, turn off **Confirm email** under Authentication → Providers → Email.

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
| `MOMO_API_USER` | For live MoMo | API user UUID from MoMo Developer portal |
| `MOMO_API_KEY` | For live MoMo | API key for that user |
| `MOMO_SUBSCRIPTION_KEY` | For live MoMo | Primary subscription key (Collection/Disbursement product) |
| `MOMO_TARGET_ENV` | MoMo | `sandbox` (default) or `production` |
| `MOMO_CALLBACK_URL` | Optional | Async callback URL for MoMo |
| `MOMO_BASE_URL` | Optional | Override API host |

`AUTH_SECRET` / `DATABASE_URL` / Prisma are **no longer used**.

### Vercel

Set these project env vars (Production + Preview as needed):

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key  
- For live MoMo: `MOMO_API_USER`, `MOMO_API_KEY`, `MOMO_SUBSCRIPTION_KEY`, and `MOMO_TARGET_ENV=production` (never commit secrets)

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

## Sandbox vs production MoMo

| Mode | When | Behaviour |
|------|------|-----------|
| **Sandbox mock** | Any of `MOMO_API_USER` / `MOMO_API_KEY` / `MOMO_SUBSCRIPTION_KEY` missing **or** `MOMO_TARGET_ENV=sandbox` | `SandboxMockProvider` simulates Collection/Disbursement with ~0.4–1.2s latency and idempotency keys. Status → `sandbox_completed` or `failed`. |
| **Production MoMo** | All three keys set **and** `MOMO_TARGET_ENV=production` | `RealMtnMomoProvider` calls MTN Open API (`https://proxy.momoapi.mtn.com` unless `MOMO_BASE_URL` overrides). |

Do not treat sandbox stubs as live settlement. ClearSend is not a licensed MTO and does not hold customer funds.

### How to get MTN MoMo keys

1. Create an account at the [MoMo Developer portal](https://momodeveloper.mtn.com/).  
2. Subscribe to **Collection** and/or **Disbursement** products — note the **Primary Key** → `MOMO_SUBSCRIPTION_KEY`.  
3. Create an **API User** (`POST /v1_0/apiuser` with `X-Reference-Id` UUID) → `MOMO_API_USER`.  
4. Create an **API Key** for that user (`POST /v1_0/apiuser/{id}/apikey`) → `MOMO_API_KEY`.  
5. Obtain OAuth tokens via `/collection/token/` or `/disbursement/token/` (Basic auth = user:key).  
6. **Ghana Remittance** is partner-gated — contact MTN for access.  
7. For live payouts set `MOMO_TARGET_ENV=production` plus the three keys (and optional `MOMO_CALLBACK_URL`). Keep secrets out of git.

Code entry points: `src/lib/momo/` (`index.ts`, `mock.ts`, `real.ts`, `types.ts`).

## Project layout

```
src/
  app/                 # App Router (landing, auth, dashboard, APIs)
  components/          # Landing + dashboard UI
  lib/
    quotes.ts          # Estimated all-in quote engine
    corridors.ts
    momo/              # MoMo Collection + Disbursement clients
    transfers.ts       # Create/execute transfer records (Supabase)
    auth.ts            # Current user helper
    supabase/          # Browser + server + middleware clients
  middleware.ts        # Protect /dashboard/* + refresh session
```

## Positioning

- Position ClearSend as **transparency + ranking + MoMo remittance UX**, not a licensed wallet or MTO.  
- Emphasize **PAPSS-aligned** regional clearing *intent* without claiming live PAPSS.  
- Highlight **MoMo soft handoff / disbursement** after a clear all-in quote.

---

© ClearSend · MoMo-ready FX transparency for West Africa
