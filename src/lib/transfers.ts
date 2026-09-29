import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { generateQuotes } from "@/lib/quotes";
import { getMomoClient, isMomoProduction } from "@/lib/momo";
import type { TransferRow } from "@/lib/database.types";
import type { CorridorId } from "@/types";

export type TransferStatus = "pending" | "sandbox_completed" | "failed";

/** App-facing transfer shape (camelCase) mapped from Supabase snake_case rows. */
export interface Transfer {
  id: string;
  userId: string;
  corridorId: string;
  currencyIn: string;
  currencyOut: string;
  amountIn: number;
  amountOut: number;
  fee: number;
  fxRate: number;
  recipientName: string;
  recipientMsisdn: string;
  status: string;
  provider: string;
  idempotencyKey: string;
  momoReference: string | null;
  errorMessage: string | null;
  quotePathId: string | null;
  createdAt: Date;
}

export interface CreateTransferInput {
  userId: string;
  corridorId: CorridorId;
  amountIn: number;
  recipientName: string;
  recipientMsisdn: string;
  quotePathId?: string;
}

export function mapTransfer(row: TransferRow): Transfer {
  return {
    id: row.id,
    userId: row.user_id,
    corridorId: row.corridor_id,
    currencyIn: row.currency_in,
    currencyOut: row.currency_out,
    amountIn: Number(row.amount_in),
    amountOut: Number(row.amount_out),
    fee: Number(row.fee),
    fxRate: Number(row.fx_rate),
    recipientName: row.recipient_name,
    recipientMsisdn: row.recipient_msisdn,
    status: row.status,
    provider: row.provider,
    idempotencyKey: row.idempotency_key,
    momoReference: row.momo_reference,
    errorMessage: row.error_message,
    quotePathId: row.quote_path_id,
    createdAt: new Date(row.created_at),
  };
}

export async function createAndExecuteTransfer(
  input: CreateTransferInput
): Promise<Transfer> {
  const supabase = await createClient();
  const quote = generateQuotes(input.corridorId, input.amountIn);
  const path =
    quote.paths.find((p) => p.id === input.quotePathId) ??
    quote.paths.find((p) => p.recommended) ??
    quote.paths[0];

  if (!path) {
    throw new Error("No quote path available");
  }

  const idempotencyKey = randomUUID();

  const { data: created, error: createError } = await supabase
    .from("transfers")
    .insert({
      user_id: input.userId,
      corridor_id: input.corridorId,
      currency_in: quote.currencyIn,
      currency_out: quote.currencyOut,
      amount_in: input.amountIn,
      amount_out: path.amountOut,
      fee: path.fee,
      fx_rate: path.fxRate,
      recipient_name: input.recipientName.trim(),
      recipient_msisdn: input.recipientMsisdn.trim().replace(/\s/g, ""),
      status: "pending",
      provider: isMomoProduction() ? "mtn_momo" : "sandbox_mock",
      idempotency_key: idempotencyKey,
      quote_path_id: path.id,
    })
    .select()
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Failed to create transfer");
  }

  const transfer = mapTransfer(created);
  const momo = getMomoClient();

  try {
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

    const finalStatus: TransferStatus =
      result.isSandboxStub && status === "sandbox_completed"
        ? "sandbox_completed"
        : !result.isSandboxStub && result.status === "SUCCESSFUL"
          ? "sandbox_completed"
          : status === "failed"
            ? "failed"
            : "pending";

    const { data: updated, error: updateError } = await supabase
      .from("transfers")
      .update({
        status: finalStatus,
        momo_reference: result.financialTransactionId ?? result.referenceId,
        error_message: result.reason ?? null,
        provider: result.provider,
      })
      .eq("id", transfer.id)
      .eq("user_id", input.userId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message ?? "Failed to update transfer");
    }

    return mapTransfer(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown MoMo error";
    const { data: failed, error: failError } = await supabase
      .from("transfers")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("id", transfer.id)
      .eq("user_id", input.userId)
      .select()
      .single();

    if (failError || !failed) {
      throw new Error(failError?.message ?? message);
    }

    return mapTransfer(failed);
  }
}

export async function listTransfersForUser(userId: string, take = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(take);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTransfer);
}

export async function getTransferForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapTransfer(data) : null;
}
