"use client";

import { useMemo, useState } from "react";
import { CORRIDORS, CURRENCY_META, defaultAmount } from "@/lib/corridors";
import { generateQuotes } from "@/lib/quotes";
import type { CorridorId, QuoteResult } from "@/types";
import { QuoteResults } from "./QuoteResults";

export function QuotePanel() {
  const [corridorId, setCorridorId] = useState<CorridorId>("NGN_GHS");
  const corridor = useMemo(
    () => CORRIDORS.find((c) => c.id === corridorId)!,
    [corridorId]
  );
  const [amountStr, setAmountStr] = useState(
    String(defaultAmount("NGN"))
  );
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [momoNotice, setMomoNotice] = useState<string | null>(null);

  function onCorridorChange(id: CorridorId) {
    setCorridorId(id);
    const next = CORRIDORS.find((c) => c.id === id)!;
    setAmountStr(String(defaultAmount(next.from)));
    setResult(null);
    setError(null);
    setMomoNotice(null);
  }

  function handleQuote(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMomoNotice(null);
    const amount = Number(amountStr.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a positive amount to quote.");
      return;
    }
    setLoading(true);
    // Tiny delay so the DEMO feel is intentional / timestamp refreshes
    window.setTimeout(() => {
      try {
        const quote = generateQuotes(corridorId, amount);
        setResult(quote);
        window.setTimeout(() => {
          document
            .getElementById("quote-results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Quote failed");
      } finally {
        setLoading(false);
      }
    }, 280);
  }

  function onMomoCta(pathId: string) {
    const path = result?.paths.find((p) => p.id === pathId);
    setMomoNotice(
      `Demo soft handoff: “${path?.provider ?? "path"}” would open MoMo receive for ${result?.corridor.toCountry ?? "the destination"}. No funds move in this demo — ClearSend never holds balances.`
    );
  }

  const fromMeta = CURRENCY_META[corridor.from];

  return (
    <section id="quote" className="scroll-mt-20 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            DEMO quotes
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Compare corridors in one step
          </h2>
          <p className="mt-3 text-slate-600">
            Pick a West Africa corridor, enter an amount, and see ranked
            all-in paths. Every result is stamped{" "}
            <span className="font-semibold text-amber-700">DEMO</span> —
            indicative only, not executable market data.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm sm:p-6">
          <form onSubmit={handleQuote} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Corridor
                </span>
                <select
                  value={corridorId}
                  onChange={(e) =>
                    onCorridorChange(e.target.value as CorridorId)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none ring-teal-600/30 focus:ring-2"
                >
                  {CORRIDORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {CURRENCY_META[c.from].flag} {c.from} →{" "}
                      {CURRENCY_META[c.to].flag} {c.to} · {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amount in ({corridor.from})
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    {fromMeta.symbol}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-3 text-sm font-semibold text-slate-900 outline-none ring-teal-600/30 focus:ring-2"
                    placeholder="Amount"
                    aria-label={`Amount in ${corridor.from}`}
                  />
                </div>
              </label>
            </div>

            {error && (
              <p className="text-sm font-medium text-rose-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {loading ? "Generating DEMO quote…" : "Get DEMO quote"}
            </button>
          </form>

          {result && (
            <QuoteResults
              result={result}
              onMomoCta={onMomoCta}
              momoNotice={momoNotice}
            />
          )}
        </div>
      </div>
    </section>
  );
}
