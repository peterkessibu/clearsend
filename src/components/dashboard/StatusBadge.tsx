const STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  sandbox_completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  failed: "bg-rose-50 text-rose-800 ring-rose-200",
};

const LABELS: Record<string, string> = {
  pending: "Pending",
  sandbox_completed: "Sandbox completed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLES[status] ?? "bg-slate-50 text-slate-700 ring-slate-200"}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
