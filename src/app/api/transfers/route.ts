import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CORRIDORS } from "@/lib/corridors";
import {
  createAndExecuteTransfer,
  listTransfersForUser,
} from "@/lib/transfers";
import type { CorridorId } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transfers = await listTransfersForUser(session.user.id);
  return NextResponse.json({ transfers });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      corridorId?: string;
      amountIn?: number;
      recipientName?: string;
      recipientMsisdn?: string;
      quotePathId?: string;
    };

    const corridorId = body.corridorId as CorridorId | undefined;
    if (!corridorId || !CORRIDORS.some((c) => c.id === corridorId)) {
      return NextResponse.json({ error: "Invalid corridor" }, { status: 400 });
    }

    const amountIn = Number(body.amountIn);
    if (!Number.isFinite(amountIn) || amountIn <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const recipientName = String(body.recipientName ?? "").trim();
    const recipientMsisdn = String(body.recipientMsisdn ?? "").trim();
    if (recipientName.length < 2) {
      return NextResponse.json(
        { error: "Recipient name required" },
        { status: 400 }
      );
    }
    if (!/^\+?\d{8,15}$/.test(recipientMsisdn.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Valid MoMo MSISDN required (8–15 digits, optional +)" },
        { status: 400 }
      );
    }

    const transfer = await createAndExecuteTransfer({
      userId: session.user.id,
      corridorId,
      amountIn,
      recipientName,
      recipientMsisdn,
      quotePathId: body.quotePathId,
    });

    return NextResponse.json({ transfer }, { status: 201 });
  } catch (err) {
    console.error("create transfer error", err);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
