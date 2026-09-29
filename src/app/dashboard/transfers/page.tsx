import Link from "next/link";
import { auth } from "@/auth";
import { listTransfersForUser } from "@/lib/transfers";
import { formatMoney, formatDemoTimestamp } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getCorridor } from "@/lib/corridors";
import type { CorridorId, Currency } from "@/types";

export default async function TransfersPage() {
  const session = await auth();
  const transfers = session?.user?.id
    ? await listTransfersForUser(session.user.id, 100)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Transfers
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your sandbox transfer history. Statuses never imply live settlement
            without MoMo keys.
          </p>
        </div>
        <Link
          href="/dashboard/send"
          className="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Send money
        </Link>
      </div>

      {transfers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-slate-600">No transfers yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
                  corridorLabel = getCorridor(t.corridorId as CorridorId).label;
                } catch {
                  /* keep */
                }
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                      <Link
                        href={`/dashboard/transfers/${t.id}`}
                        className="font-medium text-teal-700 hover:underline"
                      >
                        {formatDemoTimestamp(t.createdAt.toISOString())}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{corridorLabel}</td>
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
      )}
    </div>
  );
}
