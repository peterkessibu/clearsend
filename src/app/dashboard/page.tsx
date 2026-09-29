import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listTransfersForUser } from "@/lib/transfers";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { WalletPanel } from "@/components/dashboard/WalletPanel";
import { getCorridor } from "@/lib/corridors";
import { emptyBalances, getBalancesForUser } from "@/lib/wallet";
import type { CorridorId, Currency } from "@/types";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const transfers = user ? await listTransfersForUser(user.id, 5) : [];
  const balances = user
    ? await getBalancesForUser(user.id)
    : emptyBalances();

  const firstName = user?.name?.split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-teal-800/10 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 p-5 text-white shadow-lg shadow-teal-900/15 sm:p-7">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-100/90">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-teal-50/90">
            All-in FX clarity for West Africa corridors. Balances start at zero
            — use Load wallet for a sandbox top-up, then Exchange or Transfer
            from the balance panel. ClearSend does not hold funds as a licensed
            MTO.
          </p>
        </div>
      </section>

      <WalletPanel initialBalances={balances} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Recent transfers
          </h2>
          <Link
            href="/dashboard/transfers"
            className="text-sm font-semibold text-teal-700 transition hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded"
          >
            View all
          </Link>
        </div>
        {transfers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white px-4 py-12 text-center shadow-sm shadow-slate-900/5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M7 7h11M14 4l4 3-4 3M17 17H6M10 14l-4 3 4 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-800">
              No transfers yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Get an all-in quote and send via MoMo payout.
            </p>
            <Link
              href="/dashboard/send"
              className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Send your first transfer
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
            {transfers.map((t) => {
              let corridorLabel = t.corridorId;
              try {
                corridorLabel = getCorridor(t.corridorId as CorridorId).label;
              } catch {
                /* keep id */
              }
              return (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/transfers/${t.id}`}
                    className="flex flex-col gap-2 px-4 py-3.5 transition hover:bg-teal-50/40 focus-visible:bg-teal-50/60 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {corridorLabel}
                      </div>
                      <div className="text-xs text-slate-500">
                        To {t.recipientName} · {t.recipientMsisdn}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatMoney(t.amountIn, t.currencyIn as Currency)}
                        </div>
                        <div className="text-xs text-slate-500">
                          → {formatMoney(t.amountOut, t.currencyOut as Currency)}
                        </div>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
