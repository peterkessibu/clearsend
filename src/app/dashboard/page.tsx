import Link from "next/link";
import { auth } from "@/auth";
import { listTransfersForUser } from "@/lib/transfers";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getCorridor } from "@/lib/corridors";
import type { CorridorId, Currency } from "@/types";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const transfers = session?.user?.id
    ? await listTransfersForUser(session.user.id, 5)
    : [];

  const demoBalances: { currency: Currency; amount: number }[] = [
    { currency: "NGN", amount: 1_250_000 },
    { currency: "GHS", amount: 8_500 },
    { currency: "XOF", amount: 750_000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome{session?.user?.name ? `, ${session.user.name}` : ""}. Sandbox
            balances below are illustrative DEMO labels only.
          </p>
        </div>
        <Link
          href="/dashboard/send"
          className="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Send money
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Balances
          </h2>
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-200">
            DEMO / sandbox
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {demoBalances.map((b) => (
            <div
              key={b.currency}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {b.currency}
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {formatMoney(b.amount, b.currency)}
              </div>
              <div className="mt-2 text-[11px] text-amber-700">
                Not a real wallet balance
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent transfers
          </h2>
          <Link
            href="/dashboard/transfers"
            className="text-sm font-semibold text-teal-700 hover:underline"
          >
            View all
          </Link>
        </div>
        {transfers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
            <p className="text-sm text-slate-600">No transfers yet.</p>
            <Link
              href="/dashboard/send"
              className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:underline"
            >
              Send your first DEMO transfer →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                    className="flex flex-col gap-2 px-4 py-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
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
