import { SandboxMockProvider } from "./mock";
import { RealMtnMomoProvider } from "./real";
import type { MomoConfig, MomoProvider, MomoTargetEnv } from "./types";

export * from "./types";
export { SandboxMockProvider } from "./mock";
export { RealMtnMomoProvider } from "./real";

function readConfig(): MomoConfig | null {
  const apiUser = process.env.MOMO_API_USER?.trim();
  const apiKey = process.env.MOMO_API_KEY?.trim();
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY?.trim();
  if (!apiUser || !apiKey || !subscriptionKey) return null;

  const targetEnv = (process.env.MOMO_TARGET_ENV?.trim() ||
    "sandbox") as MomoTargetEnv;
  const baseUrl =
    process.env.MOMO_BASE_URL?.trim() ||
    (targetEnv === "production"
      ? "https://proxy.momoapi.mtn.com"
      : "https://sandbox.momodeveloper.mtn.com");

  return {
    apiUser,
    apiKey,
    subscriptionKey,
    targetEnv,
    callbackUrl: process.env.MOMO_CALLBACK_URL?.trim() || undefined,
    baseUrl,
  };
}

/** Returns real MTN client when keys exist; otherwise SandboxMockProvider. */
export function getMomoClient(): MomoProvider {
  const config = readConfig();
  if (!config) {
    return new SandboxMockProvider();
  }
  return new RealMtnMomoProvider(config);
}

export function momoModeLabel(provider: MomoProvider): string {
  return provider.isSandboxStub
    ? "DEMO / sandbox stub (no MoMo keys)"
    : `MoMo API (${process.env.MOMO_TARGET_ENV || "sandbox"})`;
}

export function hasMomoKeys(): boolean {
  return readConfig() !== null;
}
