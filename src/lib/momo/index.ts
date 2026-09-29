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

/**
 * Env-driven MoMo client:
 * - Missing keys OR MOMO_TARGET_ENV=sandbox → SandboxMockProvider
 * - MOMO_API_USER + MOMO_API_KEY + MOMO_SUBSCRIPTION_KEY and
 *   MOMO_TARGET_ENV=production → RealMtnMomoProvider (live API host)
 */
export function getMomoClient(): MomoProvider {
  const config = readConfig();
  if (!config || config.targetEnv !== "production") {
    return new SandboxMockProvider();
  }
  return new RealMtnMomoProvider(config);
}

export function momoModeLabel(provider: MomoProvider): string {
  return provider.isSandboxStub
    ? "Sandbox (mock until production keys + MOMO_TARGET_ENV=production)"
    : `MoMo API (${process.env.MOMO_TARGET_ENV || "production"})`;
}

export function hasMomoKeys(): boolean {
  return readConfig() !== null;
}

/** True when real production MoMo provider will be used. */
export function isMomoProduction(): boolean {
  const config = readConfig();
  return config !== null && config.targetEnv === "production";
}
