import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { generateQuotes } from "@/lib/quotes";
import { getMomoClient, hasMomoKeys } from "@/lib/momo";
import type { CorridorId } from "@/types";

export type TransferStatus = "pending" | "sandbox_completed" | "failed";

export interface CreateTransferInput {
  userId: string;
  corridorId: CorridorId;
  amountIn: number;
  recipientName: string;
  recipientMsisdn: string;
  quotePathId?: string;
}

export async function createAndExecuteTransfer(input: CreateTransferInput) {
  const quote = generateQuotes(input.corridorId, input.amountIn);
  const path =
    quote.paths.find((p) => p.id === input.quotePathId) ??
    quote.paths.find((p) => p.recommended) ??
    quote.paths[0];

  if (!path) {
    throw new Error("No quote path available");
  }

  const idempotencyKey = randomUUID();

  const transfer = await prisma.transfer.create({
    data: {
      userId: input.userId,
      corridorId: input.corridorId,
      currencyIn: quote.currencyIn,
      currencyOut: quote.currencyOut,
      amountIn: input.amountIn,
      amountOut: path.amountOut,
      fee: path.fee,
      fxRate: path.fxRate,
      recipientName: input.recipientName.trim(),
      recipientMsisdn: input.recipientMsisdn.trim().replace(/\s/g, ""),
      status: "pending",
      provider: hasMomoKeys() ? "mtn_momo" : "sandbox_mock",
      idempotencyKey,
      quotePathId: path.id,
    },
  });

  const momo = getMomoClient();

  try {
    // Disbursement-style payout to recipient MoMo MSISDN
    const result = await momo.transfer({
      amount: String(path.amountOut),
      currency: quote.currencyOut,
      externalId: transfer.id,
      payee: {
        partyIdType: "MSISDN",
        partyId: transfer.recipientMsisdn,
      },
      payerMessage: "ClearSend",
      payeeNote: `From ${input.recipientName}`,
      referenceId: idempotencyKey,
    });

    const status: TransferStatus =
      result.status === "SUCCESSFUL"
        ? "sandbox_completed"
        : result.status === "PENDING"
          ? "pending"
          : "failed";

    // When using real keys and SUCCESSFUL, still label carefully —
    // we use sandbox_completed for stub; for real we also use same status
    // names but provider distinguishes. Never claim live settlement without keys.
    const finalStatus: TransferStatus =
      result.isSandboxStub && status === "sandbox_completed"
        ? "sandbox_completed"
        : !result.isSandboxStub && result.status === "SUCCESSFUL"
          ? "sandbox_completed" // keep enum; UI shows provider + DEMO banner
          : status === "failed"
            ? "failed"
            : "pending";

    return prisma.transfer.update({
      where: { id: transfer.id },
      data: {
        status: finalStatus,
        momoReference: result.financialTransactionId ?? result.referenceId,
        errorMessage: result.reason ?? null,
        provider: result.provider,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown MoMo error";
    return prisma.transfer.update({
      where: { id: transfer.id },
      data: {
        status: "failed",
        errorMessage: message,
      },
    });
  }
}

export async function listTransfersForUser(userId: string, take = 50) {
  return prisma.transfer.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getTransferForUser(userId: string, id: string) {
  return prisma.transfer.findFirst({
    where: { id, userId },
  });
}
