import { CURRENCY_META } from "./corridors";
import type { Currency } from "@/types";

export function formatMoney(amount: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(amount);
  return `${meta.symbol} ${formatted}`;
}

export function formatRate(
  rate: number,
  from: Currency,
  to: Currency
): string {
  const toMeta = CURRENCY_META[to];
  const fromMeta = CURRENCY_META[from];
  const digits = rate < 1 ? 4 : 2;
  return `1 ${fromMeta.symbol.trim()} = ${rate.toFixed(digits)} ${toMeta.symbol.trim()}`;
}

export function formatDemoTimestamp(iso: string): string {
  const d = new Date(iso);
  const stamp = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
  return `${stamp} UTC · DEMO`;
}
