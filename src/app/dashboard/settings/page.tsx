import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Account profile. KYC and editing coming later.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-sm font-bold text-white"
              aria-hidden
            >
              {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {user?.name}
              </div>
              <div className="truncate text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
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
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              ClearSend does not hold funds. Mobile money is handled through
              ClearSend&apos;s operator integration for all users.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
        <h2 className="text-sm font-semibold text-slate-900">Session</h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign out on this device. You can sign back in anytime.
        </p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
