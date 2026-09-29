import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listTransfersForUser } from "@/lib/transfers";
import { formatMoney, formatQuoteTimestamp } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getCorridor } from "@/lib/corridors";
import type { CorridorId, Currency } from "@/types";

export default async function TransfersPage() {
  const user = await getCurrentUser();
  const transfers = user ? await listTransfersForUser(user.id, 100) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            History
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Transfers
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Your transfer history. ClearSend does not hold funds.
          </p>
        </div>
        <Link
          href="/dashboard/send"
          className="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Send money
        </Link>
      </div>

      {transfers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white px-4 py-12 text-center shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-800">No transfers yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Completed and pending payouts will appear here.
          </p>
          <Link
            href="/dashboard/send"
            className="mt-4 inline-flex rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Send money
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile-friendly cards */}
          <ul className="space-y-3 md:hidden">
            {transfers.map((t) => {
              let corridorLabel = t.corridorId;
              try {
                corridorLabel = getCorridor(t.corridorId as CorridorId).label;
              } catch {
                /* keep */
              }
              return (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/transfers/${t.id}`}
                    className="block rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition hover:border-teal-200 hover:bg-teal-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {corridorLabel}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {formatQuoteTimestamp(t.createdAt.toISOString())}
                        </div>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        <span className="font-medium text-slate-800">
                          {t.recipientName}
                        </span>
                        <div>{t.recipientMsisdn}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatMoney(t.amountIn, t.currencyIn as Currency)}
                        </div>
                        <div className="text-xs text-slate-500">
                          → {formatMoney(t.amountOut, t.currencyOut as Currency)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Corridor</th>
                  <th className="px-4 py-3 font-semibold">Recipient</th>
                  <th className="px-4 py-3 font-semibold">Send</th>
                  <th className="px-4 py-3 font-semibold">Receive</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((t) => {
                  let corridorLabel = t.corridorId;
                  try {
                    corridorLabel = getCorridor(
                      t.corridorId as CorridorId
                    ).label;
                  } catch {
                    /* keep */
                  }
                  return (
                    <tr key={t.id} className="hover:bg-teal-50/30">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                        <Link
                          href={`/dashboard/transfers/${t.id}`}
                          className="font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                        >
                          {formatQuoteTimestamp(t.createdAt.toISOString())}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {corridorLabel}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {t.recipientName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {t.recipientMsisdn}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {formatMoney(t.amountIn, t.currencyIn as Currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {formatMoney(t.amountOut, t.currencyOut as Currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
