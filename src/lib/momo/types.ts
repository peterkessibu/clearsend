/** MoMo Open API style interfaces — Collection (request to pay) + Disbursement/remittance payout. */

export type MomoTargetEnv = "sandbox" | "production";

export type MomoTransferStatus =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "TIMEOUT";

export interface MomoConfig {
  apiUser: string;
  apiKey: string;
  subscriptionKey: string;
  targetEnv: MomoTargetEnv;
  callbackUrl?: string;
  /** Base host, e.g. https://sandbox.momodeveloper.mtn.com */
  baseUrl: string;
}

export interface CollectionRequest {
  /** Amount in the currency of the payer party */
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: "MSISDN";
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
  /** Idempotency / X-Reference-Id */
  referenceId: string;
}

export interface DisbursementRequest {
  amount: string;
  currency: string;
  externalId: string;
  payee: {
    partyIdType: "MSISDN";
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
  referenceId: string;
}

export interface MomoOperationResult {
  referenceId: string;
  status: MomoTransferStatus;
  financialTransactionId?: string;
  reason?: string;
  provider: "sandbox_mock" | "mtn_momo";
  latencyMs: number;
  /** True when no real MoMo keys were used */
  isSandboxStub: boolean;
}

export interface MomoProvider {
  readonly name: string;
  readonly isSandboxStub: boolean;
  requestToPay(req: CollectionRequest): Promise<MomoOperationResult>;
  transfer(req: DisbursementRequest): Promise<MomoOperationResult>;
  getCollectionStatus(referenceId: string): Promise<MomoOperationResult>;
  getTransferStatus(referenceId: string): Promise<MomoOperationResult>;
}
