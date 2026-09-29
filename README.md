# ClearSend — West Africa FX + fee transparency (demo)

**ClearSend** is a pitch / product demo for **MoMo Fintech Labs**: all-in FX and fee transparency across West Africa corridors (**NGN**, **GHS**, **CFA/XOF**), with ranked quote paths and a soft handoff to MoMo receive.

> **This is a demo.** Quotes are synthetic, timestamped **DEMO**, and not live market data. ClearSend does **not** claim live PAPSS connectivity and does **not** hold funds.

## What it shows

1. **Landing** — problem / solution framing for opaque cross-border MoMo & bank transfers  
2. **Quote flow** — corridors including **NGN→GHS**, **GHS→XOF**, **XOF→GHS**, and **NGN→XOF**  
3. **Ranked results** — amount out, fee, FX, speed, DEMO timestamp, recommended path, MoMo CTA  
4. **How it works + disclaimer** — PAPSS-aligned narrative with explicit non-claims  
5. **Mobile-first** fintech UI (Next.js App Router + TypeScript + Tailwind)

## Demo limits (read this)

- Quotes are **indicative DEMO only**, regenerated client-side with a clear **DEMO** timestamp (UTC).
- **No live PAPSS**, bank, or MoMo API integration.
- **No fund holding**, custody, KYC, or settlement — MoMo buttons simulate soft handoff only.
- FX mids and fee models in `src/lib/quotes.ts` are hardcoded for storytelling, not trading.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4

## Run locally

```bash
cd clearsend   # or /workspace/clearsend on the agent box
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm install
npm run build
npm start
```

## Project layout

```
src/
  app/           # App Router pages & global styles
  components/    # Landing, quote UI, how-it-works, disclaimer
  lib/           # Corridors, demo quote engine, formatters
  types/         # Shared TypeScript types
```

## Product notes for pitches

- Position ClearSend as **transparency + ranking**, not a wallet.
- Emphasize **PAPSS-aligned** regional clearing *intent* without claiming live PAPSS.
- Highlight **MoMo soft handoff** as the receive path after the customer picks a clear all-in quote.

---

© ClearSend · Demo for MoMo Fintech Labs stakeholders
