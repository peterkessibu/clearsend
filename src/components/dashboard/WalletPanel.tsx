"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENCY_META, defaultAmount } from "@/lib/corridors";
import { formatMoney, formatRate } from "@/lib/format";
import {
  CURRENCY_NOTES,
  WALLET_CURRENCIES,
  type WalletBalances,
  type WalletExchangeQuote,
} from "@/lib/wallet-model";
import type { Currency } from "@/types";
import { Modal } from "@/components/dashboard/Modal";
import { SendMoneyForm } from "@/components/dashboard/SendMoneyForm";

type PanelMode = "idle" | "load" | "exchange" | "transfer";

export function WalletPanel({
  initialBalances,
}: {
  initialBalances: WalletBalances;
}) {
  const router = useRouter();
  const [balances, setBalances] = useState<WalletBalances>(initialBalances);
  const [mode, setMode] = useState<PanelMode>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load form
  const [loadCurrency, setLoadCurrency] = useState<Currency>("NGN");
  const [loadAmount, setLoadAmount] = useState(String(defaultAmount("NGN")));

  // Exchange form
  const [fromCurrency, setFromCurrency] = useState<Currency>("NGN");
  const [toCurrency, setToCurrency] = useState<Currency>("GHS");
  const [exchangeAmount, setExchangeAmount] = useState(
    String(defaultAmount("NGN"))
  );
  const [quote, setQuote] = useState<WalletExchangeQuote | null>(null);

  useEffect(() => {
    setBalances(initialBalances);
  }, [initialBalances]);

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25";

  const toOptions = useMemo(
    () => WALLET_CURRENCIES.filter((c) => c !== fromCurrency),
    [fromCurrency]
  );

  function openLoad() {
    setError(null);
    setSuccess(null);
    setQuote(null);
    setMode("load");
  }

  function openExchange() {
    setError(null);
    setSuccess(null);
    setQuote(null);
    setMode("exchange");
  }

  function openTransfer() {
    setError(null);
    setSuccess(null);
    setQuote(null);
    setMode("transfer");
  }

  function closePanel() {
    setMode("idle");
    setError(null);
    setQuote(null);
    setBusy(false);
  }

  function onLoadCurrencyChange(c: Currency) {
    setLoadCurrency(c);
    setLoadAmount(String(defaultAmount(c)));
  }

  function onFromChange(c: Currency) {
    setFromCurrency(c);
    setExchangeAmount(String(defaultAmount(c)));
    setQuote(null);
    if (c === toCurrency) {
      const next = WALLET_CURRENCIES.find((x) => x !== c) ?? "GHS";
      setToCurrency(next);
    }
  }

  async function submitLoad(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: loadCurrency,
          amount: Number(loadAmount),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        balances?: WalletBalances;
      };
      if (!res.ok || !data.balances) {
        setError(data.error || "Could not load wallet");
        setBusy(false);
        return;
      }
      setBalances(data.balances);
      setSuccess(
        `Added ${formatMoney(Number(loadAmount), loadCurrency)} (sandbox top-up)`
      );
      setMode("idle");
      setBusy(false);
      router.refresh();
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  async function previewExchange(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromCurrency,
          to: toCurrency,
          amountIn: Number(exchangeAmount),
          preview: true,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        quote?: WalletExchangeQuote;
      };
      if (!res.ok || !data.quote) {
        setError(data.error || "Could not estimate exchange");
        setBusy(false);
        return;
      }
      setQuote(data.quote);
      setBusy(false);
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  async function confirmExchange() {
    if (!quote) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: quote.from,
          to: quote.to,
          amountIn: quote.amountIn,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        balances?: WalletBalances;
        quote?: WalletExchangeQuote;
      };
      if (!res.ok || !data.balances || !data.quote) {
        setError(data.error || "Exchange failed");
        setBusy(false);
        return;
      }
      setBalances(data.balances);
      setSuccess(
        `Exchanged ${formatMoney(data.quote.amountIn, data.quote.from)} → ${formatMoney(data.quote.amountOut, data.quote.to)}`
      );
      setQuote(null);
      setMode("idle");
      setBusy(false);
      router.refresh();
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Corridor balances
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
            Sandbox wallet
          </span>
          {/* Primary — Load wallet */}
          <button
            type="button"
            onClick={openLoad}
            className="rounded-full bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-teal-700/25 transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Load wallet
          </button>
          {/* Secondary outline — Exchange */}
          <button
            type="button"
            onClick={openExchange}
            className="rounded-full border-2 border-teal-700 bg-white px-3.5 py-1.5 text-xs font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Exchange
          </button>
          {/* Accent — Transfer */}
          <button
            type="button"
            onClick={openTransfer}
            className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-700/25 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Transfer
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {WALLET_CURRENCIES.map((currency) => (
          <div
            key={currency}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {currency}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {CURRENCY_NOTES[currency]}
              </span>
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-slate-900">
              {formatMoney(balances[currency], currency)}
            </div>
            <div className="mt-2 text-[11px] leading-snug text-slate-500">
              Sandbox balance — not licensed custody
            </div>
          </div>
        ))}
      </div>

      {(error || success) && mode === "idle" && (
        <div
          className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm ${
            error
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
          role="status"
        >
          {error || success}
        </div>
      )}

      <Modal
        open={mode === "load"}
        onClose={closePanel}
        title="Load wallet"
        description="Sandbox top-up for this MVP UI. ClearSend does not hold customer funds as a licensed MTO — use this to try FX and send flows."
      >
        {error && (
          <div
            className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}
        <form onSubmit={submitLoad} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-700">
              Currency
              <select
                className={fieldClass}
                value={loadCurrency}
                onChange={(e) =>
                  onLoadCurrencyChange(e.target.value as Currency)
                }
              >
                {WALLET_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c} — {CURRENCY_META[c].name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Amount
              <input
                type="number"
                min="1"
                step="any"
                required
                className={fieldClass}
                value={loadAmount}
                onChange={(e) => setLoadAmount(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              {busy ? "Loading…" : "Confirm top-up"}
            </button>
            <button
              type="button"
              onClick={closePanel}
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={mode === "exchange"}
        onClose={closePanel}
        title="Exchange currencies"
        description="Wallet FX within ClearSend using estimated all-in quotes — not a licensed money transfer claim."
        size="lg"
      >
        {error && (
          <div
            className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}
        {!quote ? (
          <form onSubmit={previewExchange} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-xs font-semibold text-slate-700">
                From
                <select
                  className={fieldClass}
                  value={fromCurrency}
                  onChange={(e) => onFromChange(e.target.value as Currency)}
                >
                  {WALLET_CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c} ({formatMoney(balances[c], c)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                To
                <select
                  className={fieldClass}
                  value={toCurrency}
                  onChange={(e) => {
                    setToCurrency(e.target.value as Currency);
                    setQuote(null);
                  }}
                >
                  {toOptions.map((c) => (
                    <option key={c} value={c}>
                      {c} — {CURRENCY_META[c].name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Amount ({fromCurrency})
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  className={fieldClass}
                  value={exchangeAmount}
                  onChange={(e) => {
                    setExchangeAmount(e.target.value);
                    setQuote(null);
                  }}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex rounded-full border-2 border-teal-700 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                {busy ? "Estimating…" : "Get all-in estimate"}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">You send</span>
                <span className="font-semibold text-slate-900">
                  {formatMoney(quote.amountIn, quote.from)}
                </span>
              </div>
              <div className="mt-1.5 flex justify-between gap-2">
                <span className="text-slate-600">Fee (est.)</span>
                <span className="font-medium text-slate-800">
                  {formatMoney(quote.fee, quote.feeCurrency)}
                </span>
              </div>
              <div className="mt-1.5 flex justify-between gap-2">
                <span className="text-slate-600">FX rate</span>
                <span className="font-medium text-slate-800">
                  {formatRate(quote.fxRate, quote.from, quote.to)}
                </span>
              </div>
              <div className="mt-2 flex justify-between gap-2 border-t border-slate-200 pt-2">
                <span className="font-semibold text-teal-800">You receive</span>
                <span className="font-bold text-teal-900">
                  {formatMoney(quote.amountOut, quote.to)}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Via {quote.provider}
                {quote.corridorId ? ` · ${quote.corridorId}` : ""} — estimated
                all-in
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={confirmExchange}
                className="inline-flex rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                {busy ? "Exchanging…" : "Confirm exchange"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setQuote(null)}
                className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={mode === "transfer"}
        onClose={closePanel}
        title="Transfer"
        description="West Africa corridors · estimated all-in quote · MoMo payout"
        size="lg"
      >
        <SendMoneyForm
          embedded
          onCreated={() => {
            setMode("idle");
          }}
        />
      </Modal>
    </section>
  );
}
