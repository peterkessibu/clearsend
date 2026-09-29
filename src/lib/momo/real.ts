import type {
  CollectionRequest,
  DisbursementRequest,
  MomoConfig,
  MomoOperationResult,
  MomoProvider,
  MomoTransferStatus,
} from "./types";

/**
 * RealMtnMomoProvider — hook points for MTN MoMo Open API.
 *
 * Sandbox base: https://sandbox.momodeveloper.mtn.com
 * Typical flow:
 *  1. Create API User (POST /v1_0/apiuser) with X-Reference-Id
 *  2. Create API Key (POST /v1_0/apiuser/{id}/apikey)
 *  3. Get OAuth token (POST /collection/token/ or /disbursement/token/)
 *  4. Collection: POST /collection/v1_0/requesttopay
 *  5. Disbursement: POST /disbursement/v1_0/transfer
 *
 * Ghana Remittance product is partner-gated — contact MTN for access.
 * Zambia / other markets expose Collection + Disbursement on the portal.
 *
 * This client will throw if called without valid config; prefer SandboxMockProvider
 * when keys are absent.
 */
export class RealMtnMomoProvider implements MomoProvider {
  readonly name = "RealMtnMomoProvider";
  readonly isSandboxStub = false;

  private tokenCache: { accessToken: string; expiresAt: number } | null = null;

  constructor(private readonly config: MomoConfig) {}

  private basicAuth(): string {
    const raw = `${this.config.apiUser}:${this.config.apiKey}`;
    return Buffer.from(raw).toString("base64");
  }

  private async getToken(
    product: "collection" | "disbursement"
  ): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 30_000) {
      return this.tokenCache.accessToken;
    }

    const url = `${this.config.baseUrl}/${product}/token/`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${this.basicAuth()}`,
        "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `MoMo token error (${product}): ${res.status} ${body.slice(0, 200)}`
      );
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return data.access_token;
  }

  private mapStatus(raw?: string): MomoTransferStatus {
    switch ((raw ?? "").toUpperCase()) {
      case "SUCCESSFUL":
        return "SUCCESSFUL";
      case "FAILED":
        return "FAILED";
      case "TIMEOUT":
        return "TIMEOUT";
      default:
        return "PENDING";
    }
  }

  async requestToPay(req: CollectionRequest): Promise<MomoOperationResult> {
    const started = Date.now();
    const token = await this.getToken("collection");
    const url = `${this.config.baseUrl}/collection/v1_0/requesttopay`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": req.referenceId,
      "X-Target-Environment": this.config.targetEnv,
      "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      "Content-Type": "application/json",
    };
    if (this.config.callbackUrl) {
      headers["X-Callback-Url"] = this.config.callbackUrl;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount: req.amount,
        currency: req.currency,
        externalId: req.externalId,
        payer: req.payer,
        payerMessage: req.payerMessage ?? "ClearSend",
        payeeNote: req.payeeNote ?? "ClearSend transfer",
      }),
    });

    const latencyMs = Date.now() - started;

    if (res.status !== 202) {
      const body = await res.text();
      return {
        referenceId: req.referenceId,
        status: "FAILED",
        reason: `HTTP_${res.status}: ${body.slice(0, 200)}`,
        provider: "mtn_momo",
        latencyMs,
        isSandboxStub: false,
      };
    }

    // Poll once for status (caller may also poll separately)
    return this.getCollectionStatus(req.referenceId);
  }

  async transfer(req: DisbursementRequest): Promise<MomoOperationResult> {
    const started = Date.now();
    const token = await this.getToken("disbursement");
    const url = `${this.config.baseUrl}/disbursement/v1_0/transfer`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": req.referenceId,
      "X-Target-Environment": this.config.targetEnv,
      "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      "Content-Type": "application/json",
    };
    if (this.config.callbackUrl) {
      headers["X-Callback-Url"] = this.config.callbackUrl;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount: req.amount,
        currency: req.currency,
        externalId: req.externalId,
        payee: req.payee,
        payerMessage: req.payerMessage ?? "ClearSend",
        payeeNote: req.payeeNote ?? "ClearSend payout",
      }),
    });

    const latencyMs = Date.now() - started;

    if (res.status !== 202) {
      const body = await res.text();
      return {
        referenceId: req.referenceId,
        status: "FAILED",
        reason: `HTTP_${res.status}: ${body.slice(0, 200)}`,
        provider: "mtn_momo",
        latencyMs,
        isSandboxStub: false,
      };
    }

    return this.getTransferStatus(req.referenceId);
  }

  async getCollectionStatus(referenceId: string): Promise<MomoOperationResult> {
    const started = Date.now();
    const token = await this.getToken("collection");
    const url = `${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": this.config.targetEnv,
        "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      },
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      return {
        referenceId,
        status: "FAILED",
        reason: `HTTP_${res.status}`,
        provider: "mtn_momo",
        latencyMs,
        isSandboxStub: false,
      };
    }
    const data = (await res.json()) as {
      status?: string;
      financialTransactionId?: string;
      reason?: string;
    };
    return {
      referenceId,
      status: this.mapStatus(data.status),
      financialTransactionId: data.financialTransactionId,
      reason: data.reason,
      provider: "mtn_momo",
      latencyMs,
      isSandboxStub: false,
    };
  }

  async getTransferStatus(referenceId: string): Promise<MomoOperationResult> {
    const started = Date.now();
    const token = await this.getToken("disbursement");
    const url = `${this.config.baseUrl}/disbursement/v1_0/transfer/${referenceId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": this.config.targetEnv,
        "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      },
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      return {
        referenceId,
        status: "FAILED",
        reason: `HTTP_${res.status}`,
        provider: "mtn_momo",
        latencyMs,
        isSandboxStub: false,
      };
    }
    const data = (await res.json()) as {
      status?: string;
      financialTransactionId?: string;
      reason?: string;
    };
    return {
      referenceId,
      status: this.mapStatus(data.status),
      financialTransactionId: data.financialTransactionId,
      reason: data.reason,
      provider: "mtn_momo",
      latencyMs,
      isSandboxStub: false,
    };
  }
}
