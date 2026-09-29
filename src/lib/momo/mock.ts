import type {
  CollectionRequest,
  DisbursementRequest,
  MomoOperationResult,
  MomoProvider,
} from "./types";

const DELAY_MS = { min: 400, max: 1200 } as const;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomLatency() {
  return (
    DELAY_MS.min + Math.floor(Math.random() * (DELAY_MS.max - DELAY_MS.min))
  );
}

/** In-memory idempotency cache for the mock provider (process-local). */
const idempotencyCache = new Map<string, MomoOperationResult>();

function buildSuccess(
  referenceId: string,
  latencyMs: number
): MomoOperationResult {
  return {
    referenceId,
    status: "SUCCESSFUL",
    financialTransactionId: `SANDBOX-${referenceId.slice(0, 8).toUpperCase()}`,
    provider: "sandbox_mock",
    latencyMs,
    isSandboxStub: true,
  };
}

/**
 * SandboxMockProvider — used when MoMo env keys are missing.
 * Simulates Collection + Disbursement with latency and idempotency.
 * NEVER claims live settlement.
 */
export class SandboxMockProvider implements MomoProvider {
  readonly name = "SandboxMockProvider";
  readonly isSandboxStub = true;

  async requestToPay(req: CollectionRequest): Promise<MomoOperationResult> {
    const cached = idempotencyCache.get(`col:${req.referenceId}`);
    if (cached) return { ...cached, latencyMs: 0 };

    const latencyMs = randomLatency();
    await sleep(latencyMs);

    // Soft fail if MSISDN looks obviously invalid
    if (!/^\+?\d{8,15}$/.test(req.payer.partyId.replace(/\s/g, ""))) {
      const failed: MomoOperationResult = {
        referenceId: req.referenceId,
        status: "FAILED",
        reason: "INVALID_MSISDN",
        provider: "sandbox_mock",
        latencyMs,
        isSandboxStub: true,
      };
      idempotencyCache.set(`col:${req.referenceId}`, failed);
      return failed;
    }

    const result = buildSuccess(req.referenceId, latencyMs);
    idempotencyCache.set(`col:${req.referenceId}`, result);
    return result;
  }

  async transfer(req: DisbursementRequest): Promise<MomoOperationResult> {
    const cached = idempotencyCache.get(`dis:${req.referenceId}`);
    if (cached) return { ...cached, latencyMs: 0 };

    const latencyMs = randomLatency();
    await sleep(latencyMs);

    if (!/^\+?\d{8,15}$/.test(req.payee.partyId.replace(/\s/g, ""))) {
      const failed: MomoOperationResult = {
        referenceId: req.referenceId,
        status: "FAILED",
        reason: "INVALID_MSISDN",
        provider: "sandbox_mock",
        latencyMs,
        isSandboxStub: true,
      };
      idempotencyCache.set(`dis:${req.referenceId}`, failed);
      return failed;
    }

    const result = buildSuccess(req.referenceId, latencyMs);
    idempotencyCache.set(`dis:${req.referenceId}`, result);
    return result;
  }

  async getCollectionStatus(referenceId: string): Promise<MomoOperationResult> {
    return (
      idempotencyCache.get(`col:${referenceId}`) ?? {
        referenceId,
        status: "PENDING",
        provider: "sandbox_mock",
        latencyMs: 0,
        isSandboxStub: true,
      }
    );
  }

  async getTransferStatus(referenceId: string): Promise<MomoOperationResult> {
    return (
      idempotencyCache.get(`dis:${referenceId}`) ?? {
        referenceId,
        status: "PENDING",
        provider: "sandbox_mock",
        latencyMs: 0,
        isSandboxStub: true,
      }
    );
  }
}
