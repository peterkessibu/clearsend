import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTransferForUser } from "@/lib/transfers";
import { formatMoney, formatDemoTimestamp, formatRate } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getCorridor } from "@/lib/corridors";
import type { CorridorId, Currency } from "@/types";

export default async function TransferReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const transfer = await getTransferForUser(user.id, id);
  if (!transfer) notFound();

  let corridorLabel = transfer.corridorId;
  try {
    corridorLabel = getCorridor(transfer.corridorId as CorridorId).label;
  } catch {
    /* keep */
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/dashboard/transfers"
        className="text-sm font-semibold text-teal-700 hover:underline"
      >
        ← Transfers
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Receipt</h1>
            <p className="mt-1 text-xs text-slate-500">
              {formatDemoTimestamp(transfer.createdAt.toISOString())}
            </p>
          </div>
          <StatusBadge status={transfer.status} />
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Corridor</dt>
            <dd className="font-medium text-slate-900">{corridorLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">You sent</dt>
            <dd className="font-semibold text-slate-900">
              {formatMoney(transfer.amountIn, transfer.currencyIn as Currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Fee</dt>
            <dd className="text-slate-800">
              {formatMoney(transfer.fee, transfer.currencyIn as Currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">FX rate</dt>
            <dd className="text-slate-800">
              {formatRate(
                transfer.fxRate,
                transfer.currencyIn as Currency,
                transfer.currencyOut as Currency
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
            <dt className="text-slate-500">Recipient gets</dt>
            <dd className="text-lg font-bold text-teal-800">
              {formatMoney(transfer.amountOut, transfer.currencyOut as Currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Recipient</dt>
            <dd className="text-right font-medium text-slate-900">
              {transfer.recipientName}
              <div className="text-xs font-normal text-slate-500">
                {transfer.recipientMsisdn}
              </div>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Provider</dt>
            <dd className="font-medium text-slate-800">{transfer.provider}</dd>
          </div>
          {transfer.momoReference && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Reference</dt>
              <dd className="break-all font-mono text-xs text-slate-700">
                {transfer.momoReference}
              </dd>
            </div>
          )}
          {transfer.errorMessage && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-rose-800">
              {transfer.errorMessage}
            </div>
          )}
        </dl>

        <p className="mt-6 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {transfer.provider === "sandbox_mock"
            ? "Executed via SandboxMockProvider — simulated success only. No live MoMo settlement."
            : "MoMo API path used. Confirm target environment and keys before treating as live."}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/send"
          className="flex-1 rounded-full bg-teal-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800"
        >
          Send again
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
