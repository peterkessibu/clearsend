"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CORRIDORS, CURRENCY_META, defaultAmount } from "@/lib/corridors";
import { generateQuotes } from "@/lib/quotes";
import { formatMoney, formatRate } from "@/lib/format";
import type { CorridorId } from "@/types";

type Step = "details" | "review" | "sending";

type SendMoneyFormProps = {
  /** Called after a transfer is created (before navigation). Useful to close a modal. */
  onCreated?: (transferId: string) => void;
  /** Hide the page chrome when embedded in a modal */
  embedded?: boolean;
};

export function SendMoneyForm({
  onCreated,
  embedded = false,
}: SendMoneyFormProps) {
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
      onCreated?.(data.transfer.id);
      router.push(`/dashboard/transfers/${data.transfer.id}`);
      router.refresh();
    } catch {
      setError("Network error");
      setStep("review");
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25";

  return (
    <div className={embedded ? "space-y-4" : "mx-auto max-w-lg space-y-6"}>
      {!embedded && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            New transfer
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Send money
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            West Africa corridors · estimated all-in quote · MoMo payout
          </p>
        </div>
      )}

      <ol className="flex gap-2 text-xs font-semibold" aria-label="Send steps">
        {(
          [
            ["details", "1. Details"],
            ["review", "2. Review"],
            ["sending", "3. Confirm"],
          ] as const
        ).map(([key, label]) => (
          <li
            key={key}
            aria-current={step === key ? "step" : undefined}
            className={`flex-1 rounded-full px-2 py-2 text-center transition ${
              step === key
                ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === "details" && (
        <form
          onSubmit={goReview}
          className={
            embedded
              ? "space-y-4"
              : "space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6"
          }
        >
          <div>
            <label
              htmlFor="corridor"
              className="block text-sm font-medium text-slate-700"
            >
              Corridor
            </label>
            <select
              id="corridor"
              value={corridorId}
              onChange={(e) => onCorridorChange(e.target.value as CorridorId)}
              className={fieldClass}
            >
              {CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.from}→{c.to})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700"
            >
              Amount ({CURRENCY_META[corridor.from].symbol.trim()})
            </label>
            <input
              id="amount"
              type="number"
              min={1}
              step="any"
              required
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="recipientName"
              className="block text-sm font-medium text-slate-700"
            >
              Recipient name
            </label>
            <input
              id="recipientName"
              type="text"
              required
              minLength={2}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Ama Mensah"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="msisdn"
              className="block text-sm font-medium text-slate-700"
            >
              MoMo MSISDN
            </label>
            <input
              id="msisdn"
              type="tel"
              required
              value={recipientMsisdn}
              onChange={(e) => setRecipientMsisdn(e.target.value)}
              placeholder="+233241234567"
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Phone number for MoMo receive (8–15 digits)
            </p>
          </div>

          {path && quote && (
            <div className="rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-emerald-50/60 px-4 py-3.5 text-sm text-teal-950">
              <div className="font-semibold">Estimated all-in quote</div>
              <div className="mt-1.5">
                Recipient gets{" "}
                <span className="font-bold">
                  {formatMoney(path.amountOut, quote.currencyOut)}
                </span>
              </div>
              <div className="mt-1 text-xs text-teal-800/80">
                Fee {formatMoney(path.fee, quote.currencyIn)} ·{" "}
                {formatRate(path.fxRate, quote.currencyIn, quote.currencyOut)}
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Review quote
          </button>
        </form>
      )}

      {step === "review" && path && quote && (
        <div
          className={
            embedded
              ? "space-y-4"
              : "space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6"
          }
        >
          <h2 className="text-lg font-bold text-slate-900">
            Review all-in quote
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Corridor</dt>
              <dd className="font-medium text-slate-900">{corridor.label}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">You send</dt>
              <dd className="font-semibold text-slate-900">
                {formatMoney(Number(amountIn), quote.currencyIn)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Fee</dt>
              <dd className="text-slate-800">
                {formatMoney(path.fee, quote.currencyIn)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">FX</dt>
              <dd className="text-slate-800">
                {formatRate(path.fxRate, quote.currencyIn, quote.currencyOut)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-100 pt-2.5">
              <dt className="text-slate-500">Recipient gets</dt>
              <dd className="text-base font-bold text-teal-800">
                {formatMoney(path.amountOut, quote.currencyOut)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">To</dt>
              <dd className="text-right font-medium text-slate-900">
                {recipientName}
                <div className="text-xs font-normal text-slate-500">
                  {recipientMsisdn}
                </div>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Path</dt>
              <dd className="font-medium text-slate-800">{path.provider}</dd>
            </div>
          </dl>

          <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-100">
            Confirming creates a pending transfer and requests a MoMo payout
            through ClearSend. ClearSend does not hold funds.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              Back
            </button>
            <button
              type="button"
              onClick={confirmSend}
              className="flex-1 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              Confirm send
            </button>
          </div>
        </div>
      )}

      {step === "sending" && (
        <div
          className={
            embedded
              ? "px-2 py-10 text-center"
              : "rounded-2xl border border-slate-200/80 bg-white px-5 py-12 text-center shadow-sm shadow-slate-900/5"
          }
        >
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700"
            role="status"
            aria-label="Sending"
          />
          <p className="mt-4 text-sm font-medium text-slate-700">
            Creating transfer &amp; calling MoMo client…
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Payout may take a moment to confirm
          </p>
        </div>
      )}
    </div>
  );
}
