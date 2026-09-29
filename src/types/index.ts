export type Currency = "NGN" | "GHS" | "XOF";

export type CorridorId = "NGN_GHS" | "GHS_XOF" | "XOF_GHS" | "NGN_XOF";

export interface Corridor {
  id: CorridorId;
  from: Currency;
  to: Currency;
  label: string;
  fromCountry: string;
  toCountry: string;
}

export type SpeedBand = "instant" | "minutes" | "same_day" | "1_2_days";

export interface QuotePath {
  id: string;
  provider: string;
  rail: string;
  amountIn: number;
  amountOut: number;
  fee: number;
  feeCurrency: Currency;
  fxRate: number;
  midRate: number;
  speed: SpeedBand;
  speedLabel: string;
  recommended: boolean;
  momoCompatible: boolean;
  notes?: string;
}

export interface QuoteResult {
  corridor: Corridor;
  amountIn: number;
  currencyIn: Currency;
  currencyOut: Currency;
  paths: QuotePath[];
  generatedAt: string; // ISO
}
