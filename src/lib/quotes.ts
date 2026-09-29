import { getCorridor } from "./corridors";
import type {
  CorridorId,
  Currency,
  QuotePath,
  QuoteResult,
  SpeedBand,
} from "@/types";

/** Model mid rates used for estimated all-in quotes until a live FX feed is connected. */
const MID_RATES: Record<CorridorId, number> = {
  NGN_GHS: 0.0108, // 1 NGN → GHS
  GHS_XOF: 42.5, // 1 GHS → XOF
  XOF_GHS: 0.0235, // 1 XOF → GHS
  NGN_XOF: 0.46, // 1 NGN → XOF
};

interface ProviderSeed {
  id: string;
  provider: string;
  rail: string;
  /** Multiplier vs mid (lower = worse FX for customer) */
  fxHaircut: number;
  /** Fee as fraction of amount in */
  feeBps: number;
  /** Flat fee in source currency */
  flatFee: number;
  speed: SpeedBand;
  speedLabel: string;
  momoCompatible: boolean;
  notes?: string;
}

const PROVIDERS: ProviderSeed[] = [
  {
    id: "clearsend-papss",
    provider: "ClearSend Direct",
    rail: "PAPSS-aligned path",
    fxHaircut: 0.997,
    feeBps: 45,
    flatFee: 0,
    speed: "minutes",
    speedLabel: "~5–15 min",
    momoCompatible: true,
    notes: "PAPSS-aligned clearing path — ClearSend does not claim live PAPSS connectivity",
  },
  {
    id: "momo-rail",
    provider: "MoMo Corridor",
    rail: "Mobile money receive",
    fxHaircut: 0.992,
    feeBps: 80,
    flatFee: 0,
    speed: "instant",
    speedLabel: "Near-instant",
    momoCompatible: true,
    notes: "Soft handoff to MoMo wallet receive",
  },
  {
    id: "bank-swiftish",
    provider: "Correspondent Bank",
    rail: "Nostro / SWIFT-style",
    fxHaircut: 0.978,
    feeBps: 120,
    flatFee: 15,
    speed: "1_2_days",
    speedLabel: "1–2 business days",
    momoCompatible: false,
    notes: "Higher FX spread + intermediary fees typical today",
  },
  {
    id: "fintech-agg",
    provider: "Regional Aggregator",
    rail: "API wallet bridge",
    fxHaircut: 0.988,
    feeBps: 95,
    flatFee: 5,
    speed: "same_day",
    speedLabel: "Same day",
    momoCompatible: true,
  },
  {
    id: "otc-desk",
    provider: "OTC Desk",
    rail: "Manual settlement",
    fxHaircut: 0.985,
    feeBps: 60,
    flatFee: 25,
    speed: "same_day",
    speedLabel: "Same day",
    momoCompatible: false,
    notes: "Human-assisted desk — variable liquidity",
  },
];

function speedRank(s: SpeedBand): number {
  switch (s) {
    case "instant":
      return 4;
    case "minutes":
      return 3;
    case "same_day":
      return 2;
    case "1_2_days":
      return 1;
  }
}

function buildPath(
  seed: ProviderSeed,
  amountIn: number,
  from: Currency,
  midRate: number
): QuotePath {
  // Scale flat fees roughly to corridor currency magnitude
  const flatScale =
    from === "NGN" ? 150 : from === "XOF" ? 100 : from === "GHS" ? 1 : 1;
  const flat = seed.flatFee * flatScale;
  const pctFee = amountIn * (seed.feeBps / 10_000);
  const fee = Math.round((pctFee + flat) * 100) / 100;
  const netIn = Math.max(amountIn - fee, 0);
  const fxRate = midRate * seed.fxHaircut;
  const amountOut =
    from === "XOF" || (from === "NGN" && midRate > 0.1)
      ? Math.round(netIn * fxRate)
      : Math.round(netIn * fxRate * 100) / 100;

  return {
    id: seed.id,
    provider: seed.provider,
    rail: seed.rail,
    amountIn,
    amountOut,
    fee,
    feeCurrency: from,
    fxRate,
    midRate,
    speed: seed.speed,
    speedLabel: seed.speedLabel,
    recommended: false,
    momoCompatible: seed.momoCompatible,
    notes: seed.notes,
  };
}

function scorePath(p: QuotePath): number {
  // Prefer higher amount out, then speed
  return p.amountOut * 1000 + speedRank(p.speed) * 10 + (p.momoCompatible ? 50 : 0);
}

export function generateQuotes(
  corridorId: CorridorId,
  amountIn: number
): QuoteResult {
  if (!Number.isFinite(amountIn) || amountIn <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const corridor = getCorridor(corridorId);
  const midRate = MID_RATES[corridorId];
  const paths = PROVIDERS.map((seed) =>
    buildPath(seed, amountIn, corridor.from, midRate)
  ).sort((a, b) => scorePath(b) - scorePath(a));

  if (paths[0]) paths[0].recommended = true;

  return {
    corridor,
    amountIn,
    currencyIn: corridor.from,
    currencyOut: corridor.to,
    paths,
    generatedAt: new Date().toISOString(),
  };
}
