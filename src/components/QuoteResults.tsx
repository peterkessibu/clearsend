import { CURRENCY_META } from "@/lib/corridors";
import { formatDemoTimestamp, formatMoney, formatRate } from "@/lib/format";
import type { QuoteResult } from "@/types";

interface Props {
  result: QuoteResult;
  onMomoCta: (pathId: string) => void;
  momoNotice: string | null;
}

export function QuoteResults({ result, onMomoCta, momoNotice }: Props) {
  const outMeta = CURRENCY_META[result.currencyOut];

  return (
    <div id="quote-results" className="mt-6 space-y-4 scroll-mt-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Ranked paths · {result.corridor.label}
          </h3>
          <p className="text-sm text-slate-600">
            Sending {formatMoney(result.amountIn, result.currencyIn)} →{" "}
            {outMeta.flag} {outMeta.name}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {formatDemoTimestamp(result.generatedAt)}
        </div>
      </div>

      {momoNotice && (
        <div
          role="status"
          className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900"
        >
          {momoNotice}
        </div>
      )}

      <ol className="space-y-3">
        {result.paths.map((path, index) => (
          <li
            key={path.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
              path.recommended
                ? "border-teal-300 ring-2 ring-teal-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    path.recommended
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {path.provider}
                    </h4>
                    {path.recommended && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                        Recommended
                      </span>
                    )}
                    {path.momoCompatible && (
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                        MoMo ready
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">{path.rail}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                  Amount out
                </div>
                <div className="text-xl font-bold tracking-tight text-slate-900">
                  {formatMoney(path.amountOut, result.currencyOut)}
                </div>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-[11px] font-medium text-slate-600">Fee</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                  {formatMoney(path.fee, path.feeCurrency)}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-[11px] font-medium text-slate-600">FX rate</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                  {formatRate(
                    path.fxRate,
                    result.currencyIn,
                    result.currencyOut
                  )}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-[11px] font-medium text-slate-600">Speed</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                  {path.speedLabel}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-[11px] font-medium text-slate-600">
                  vs mid
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                  {(
                    ((path.fxRate - path.midRate) / path.midRate) *
                    100
                  ).toFixed(2)}
                  %
                </dd>
              </div>
            </dl>

            {path.notes && (
              <p className="mt-3 text-xs text-slate-600">{path.notes}</p>
            )}

            {path.momoCompatible && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onMomoCta(path.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 sm:w-auto"
                >
                  Soft handoff to MoMo receive
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
