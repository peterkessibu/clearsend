import { auth } from "@/auth";
import { hasMomoKeys } from "@/lib/momo";

export default async function SettingsPage() {
  const session = await auth();
  const momoConfigured = hasMomoKeys();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Account stub — profile editing and KYC coming later.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Name
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {session?.user?.name}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {session?.user?.email}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            MoMo API
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {momoConfigured
              ? `Configured (${process.env.MOMO_TARGET_ENV || "sandbox"})`
              : "Not configured — using SandboxMockProvider"}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Set MOMO_API_USER, MOMO_API_KEY, MOMO_SUBSCRIPTION_KEY to enable the
            real client hook points. Never claim live settlement without keys.
          </p>
        </div>
      </div>
    </div>
  );
}
