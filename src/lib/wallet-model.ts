import { CORRIDORS } from "@/lib/corridors";
import { generateQuotes } from "@/lib/quotes";
import type { WalletBalanceRow } from "@/lib/database.types";
import type { CorridorId, Currency } from "@/types";

export const WALLET_CURRENCIES: Currency[] = ["NGN", "GHS", "XOF"];

export const CURRENCY_NOTES: Record<Currency, string> = {
  NGN: "Nigeria",
  GHS: "Ghana",
  XOF: "CFA / WAEMU",
};

export type WalletBalances = Record<Currency, number>;

export interface WalletExchangeQuote {
  from: Currency;
  to: Currency;
  amountIn: number;
  amountOut: number;
  fee: number;
  feeCurrency: Currency;
  fxRate: number;
  midRate: number;
  corridorId: CorridorId | null;
  provider: string;
}

const ZERO_BALANCES: WalletBalances = { NGN: 0, GHS: 0, XOF: 0 };

/** Mid rates for pairs not covered by CORRIDORS (inverse of quotes.ts mids). */
const EXTRA_MIDS: Partial<Record<`${Currency}_${Currency}`, number>> = {
  GHS_NGN: 1 / 0.0108,
  XOF_NGN: 1 / 0.46,
};

export function isWalletCurrency(value: string): value is Currency {
  return (WALLET_CURRENCIES as string[]).includes(value);
}

export function mapBalances(rows: WalletBalanceRow[] | null): WalletBalances {
  const out: WalletBalances = { ...ZERO_BALANCES };
  for (const row of rows ?? []) {
    if (isWalletCurrency(row.currency)) {
      out[row.currency] = Number(row.amount) || 0;
    }
  }
  return out;
}

export function emptyBalances(): WalletBalances {
  return { ...ZERO_BALANCES };
}

/**
 * All-in wallet FX estimate using corridor quotes when available,
 * otherwise ClearSend Direct–style mid + haircut for reverse pairs.
 */
export function quoteWalletExchange(
  from: Currency,
  to: Currency,
  amountIn: number
): WalletExchangeQuote {
  if (from === to) {
    throw new Error("Choose two different currencies");
  }
  if (!Number.isFinite(amountIn) || amountIn <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const corridor = CORRIDORS.find((c) => c.from === from && c.to === to);
  if (corridor) {
    const quote = generateQuotes(corridor.id, amountIn);
    const path = quote.paths.find((p) => p.recommended) ?? quote.paths[0];
    if (!path) throw new Error("No quote path available");
    return {
      from,
      to,
      amountIn,
      amountOut: path.amountOut,
      fee: path.fee,
      feeCurrency: path.feeCurrency,
      fxRate: path.fxRate,
      midRate: path.midRate,
      corridorId: corridor.id,
      provider: path.provider,
    };
  }

  const midKey = `${from}_${to}` as `${Currency}_${Currency}`;
  const midRate = EXTRA_MIDS[midKey];
  if (midRate == null) {
    throw new Error(`Unsupported exchange pair: ${from} → ${to}`);
  }

  // Match ClearSend Direct seed (fxHaircut 0.997, feeBps 45)
  const feeBps = 45;
  const fxHaircut = 0.997;
  const fee = Math.round(amountIn * (feeBps / 10_000) * 100) / 100;
  const netIn = Math.max(amountIn - fee, 0);
  const fxRate = midRate * fxHaircut;
  const amountOut =
    to === "XOF" || from === "XOF"
      ? Math.round(netIn * fxRate)
      : Math.round(netIn * fxRate * 100) / 100;

  return {
    from,
    to,
    amountIn,
    amountOut,
    fee,
    feeCurrency: from,
    fxRate,
    midRate,
    corridorId: null,
    provider: "ClearSend Direct",
  };
}
