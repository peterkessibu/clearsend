import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Account profile. KYC and editing coming later.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Name
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {user?.name}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {user?.email}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payouts
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            MoMo payouts are operated by ClearSend
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ClearSend does not hold funds. Mobile money is handled through
            ClearSend&apos;s operator integration for all users.
          </p>
        </div>
      </div>
    </div>
  );
}
