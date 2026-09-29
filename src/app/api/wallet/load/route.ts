import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isWalletCurrency, loadWallet } from "@/lib/wallet";

const MAX_LOAD = 50_000_000;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      currency?: string;
      amount?: number;
    };

    const currency = String(body.currency ?? "");
    if (!isWalletCurrency(currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    if (amount > MAX_LOAD) {
      return NextResponse.json(
        { error: "Amount exceeds sandbox top-up limit" },
        { status: 400 }
      );
    }

    const balances = await loadWallet(currency, amount);
    return NextResponse.json({ balances }, { status: 200 });
  } catch (err) {
    console.error("wallet load error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load wallet" },
      { status: 500 }
    );
  }
}
