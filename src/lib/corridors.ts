import type { Corridor, CorridorId, Currency } from "@/types";

export const CORRIDORS: Corridor[] = [
  {
    id: "NGN_GHS",
    from: "NGN",
    to: "GHS",
    label: "Nigeria → Ghana",
    fromCountry: "Nigeria",
    toCountry: "Ghana",
  },
  {
    id: "GHS_XOF",
    from: "GHS",
    to: "XOF",
    label: "Ghana → WAEMU (CFA)",
    fromCountry: "Ghana",
    toCountry: "WAEMU / CFA",
  },
  {
    id: "XOF_GHS",
    from: "XOF",
    to: "GHS",
    label: "WAEMU (CFA) → Ghana",
    fromCountry: "WAEMU / CFA",
    toCountry: "Ghana",
  },
  {
    id: "NGN_XOF",
    from: "NGN",
    to: "XOF",
    label: "Nigeria → WAEMU (CFA)",
    fromCountry: "Nigeria",
    toCountry: "WAEMU / CFA",
  },
];

export const CURRENCY_META: Record<
  Currency,
  { name: string; symbol: string; flag: string; decimals: number }
> = {
  NGN: { name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", decimals: 2 },
  GHS: { name: "Ghanaian Cedi", symbol: "GH₵", flag: "🇬🇭", decimals: 2 },
  XOF: { name: "West African CFA", symbol: "CFA", flag: "🌍", decimals: 0 },
};

export function getCorridor(id: CorridorId): Corridor {
  const c = CORRIDORS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown corridor: ${id}`);
  return c;
}

export function defaultAmount(from: Currency): number {
  switch (from) {
    case "NGN":
      return 500_000;
    case "GHS":
      return 5_000;
    case "XOF":
      return 500_000;
  }
}
