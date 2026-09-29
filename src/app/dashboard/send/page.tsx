"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CORRIDORS, CURRENCY_META, defaultAmount } from "@/lib/corridors";
import { generateQuotes } from "@/lib/quotes";
import { formatMoney, formatRate } from "@/lib/format";
import type { CorridorId } from "@/types";

type Step = "details" | "review" | "sending";

export default function SendMoneyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [corridorId, setCorridorId] = useState<CorridorId>("NGN_GHS");
  const corridor = CORRIDORS.find((c) => c.id === corridorId)!;
  const [amountIn, setAmountIn] = useState(String(defaultAmount("NGN")));
  const [recipientName, setRecipientName] = useState("");
  const [recipientMsisdn, setRecipientMsisdn] = useState("");
  const [error, setError] = useState<string | null>(null);

  const quote = useMemo(() => {
    const n = Number(amountIn);
    if (!Number.isFinite(n) || n <= 0) return null;
    try {
      return generateQuotes(corridorId, n);
    } catch {
      return null;
    }
  }, [corridorId, amountIn]);

  const path = quote?.paths.find((p) => p.recommended) ?? quote?.paths[0];

  function onCorridorChange(id: CorridorId) {
    setCorridorId(id);
    const c = CORRIDORS.find((x) => x.id === id)!;
    setAmountIn(String(defaultAmount(c.from)));
  }

  function goReview(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!quote || !path) {
      setError("Enter a valid amount");
      return;
    }
    if (recipientName.trim().length < 2) {
      setError("Recipient name required");
      return;
    }
    if (!/^\+?\d{8,15}$/.test(recipientMsisdn.trim().replace(/\s/g, ""))) {
      setError("Valid MoMo MSISDN required (8–15 digits)");
      return;
    }
    setStep("review");
  }

  async function confirmSend() {
    setError(null);
    setStep("sending");
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corridorId,
          amountIn: Number(amountIn),
          recipientName: recipientName.trim(),
          recipientMsisdn: recipientMsisdn.trim(),
          quotePathId: path?.id,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        transfer?: { id: string };
      };
      if (!res.ok || !data.transfer) {
        setError(data.error || "Transfer failed");
        setStep("review");
        return;
      }
      router.push(`/dashboard/transfers/${data.transfer.id}`);
      router.refresh();
    } catch {
      setError("Network error");
      setStep("review");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Send money
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          West Africa corridors · DEMO all-in quote · MoMo sandbox payout stub
        </p>
      </div>

      {/* Steps indicator */}
      <ol className="flex gap-2 text-xs font-semibold">
        {(
          [
            ["details", "1. Details"],
            ["review", "2. Review"],
            ["sending", "3. Confirm"],
          ] as const
        ).map(([key, label]) => (
          <li
            key={key}
            className={`flex-1 rounded-full px-2 py-1.5 text-center ${
              step === key
                ? "bg-teal-700 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === "details" && (
        <form
          onSubmit={goReview}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Corridor
            </label>
            <select
              value={corridorId}
              onChange={(e) => onCorridorChange(e.target.value as CorridorId)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:ring-2"
            >
              {CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.from}→{c.to})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Amount ({CURRENCY_META[corridor.from].symbol.trim()})
            </label>
            <input
              type="number"
              min={1}
              step="any"
              required
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Recipient name
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Ama Mensah"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              MoMo MSISDN
            </label>
            <input
              type="tel"
              required
              value={recipientMsisdn}
              onChange={(e) => setRecipientMsisdn(e.target.value)}
              placeholder="+233241234567"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              Phone number for MoMo receive (8–15 digits)
            </p>
          </div>

          {path && quote && (
            <div className="rounded-xl bg-teal-50 px-3 py-3 text-sm text-teal-900">
              <div className="font-semibold">Indicative all-in (DEMO)</div>
              <div className="mt-1">
                Recipient gets{" "}
                <span className="font-bold">
                  {formatMoney(path.amountOut, quote.currencyOut)}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-teal-800/80">
                Fee {formatMoney(path.fee, quote.currencyIn)} ·{" "}
                {formatRate(path.fxRate, quote.currencyIn, quote.currencyOut)}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Review quote
          </button>
        </form>
      )}

      {step === "review" && path && quote && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Review all-in quote</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Corridor</dt>
              <dd className="font-medium">{corridor.label}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">You send</dt>
              <dd className="font-semibold">
                {formatMoney(Number(amountIn), quote.currencyIn)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fee</dt>
              <dd>{formatMoney(path.fee, quote.currencyIn)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">FX</dt>
              <dd>
                {formatRate(path.fxRate, quote.currencyIn, quote.currencyOut)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-slate-500">Recipient gets</dt>
              <dd className="text-base font-bold text-teal-800">
                {formatMoney(path.amountOut, quote.currencyOut)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">To</dt>
              <dd className="text-right font-medium">
                {recipientName}
                <div className="text-xs font-normal text-slate-500">
                  {recipientMsisdn}
                </div>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Path</dt>
              <dd className="font-medium">{path.provider}</dd>
            </div>
          </dl>

          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Confirming creates a pending transfer, then calls the MoMo client
            (SandboxMockProvider if no keys). This is DEMO — not live settlement.
          </p>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={confirmSend}
              className="flex-1 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Confirm send
            </button>
          </div>
        </div>
      )}

      {step === "sending" && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
          <p className="mt-4 text-sm font-medium text-slate-700">
            Creating transfer &amp; calling MoMo client…
          </p>
          <p className="mt-1 text-xs text-slate-500">Sandbox stub may take ~1s</p>
        </div>
      )}
    </div>
  );
}
