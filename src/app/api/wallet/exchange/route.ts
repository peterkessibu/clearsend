import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  exchangeWallet,
  isWalletCurrency,
  quoteWalletExchange,
} from "@/lib/wallet";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      from?: string;
      to?: string;
      amountIn?: number;
      preview?: boolean;
    };

    const from = String(body.from ?? "");
    const to = String(body.to ?? "");
    if (!isWalletCurrency(from) || !isWalletCurrency(to)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    if (from === to) {
      return NextResponse.json(
        { error: "Choose two different currencies" },
        { status: 400 }
      );
    }

    const amountIn = Number(body.amountIn);
    if (!Number.isFinite(amountIn) || amountIn <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (body.preview) {
      const quote = quoteWalletExchange(from, to, amountIn);
      return NextResponse.json({ quote });
    }

    const result = await exchangeWallet(from, to, amountIn);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to exchange";
    const status = /insufficient/i.test(message)
      ? 400
      : /unsupported|different|positive/i.test(message)
        ? 400
        : 500;
    if (status === 500) console.error("wallet exchange error", err);
    return NextResponse.json({ error: message }, { status });
  }
}
