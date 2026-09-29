import { getCurrentUser } from "@/lib/auth";
import { hasMomoKeys, isMomoProduction } from "@/lib/momo";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const keysPresent = hasMomoKeys();
  const liveMomo = isMomoProduction();
  const targetEnv = process.env.MOMO_TARGET_ENV?.trim() || "sandbox";

  let momoStatus: string;
  if (liveMomo) {
    momoStatus = "Production MoMo API configured";
  } else if (keysPresent) {
    momoStatus = `Keys present · target ${targetEnv} → SandboxMockProvider (set MOMO_TARGET_ENV=production for live API)`;
  } else {
    momoStatus = "Using SandboxMockProvider (set MoMo keys + MOMO_TARGET_ENV=production for live API)";
  }

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
            MoMo API
          </div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {momoStatus}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Live MoMo requires MOMO_API_USER, MOMO_API_KEY, MOMO_SUBSCRIPTION_KEY
            and MOMO_TARGET_ENV=production. ClearSend does not hold funds.
          </p>
        </div>
      </div>
    </div>
  );
}
