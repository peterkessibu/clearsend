import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBalancesForUser } from "@/lib/wallet";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const balances = await getBalancesForUser(user.id);
    return NextResponse.json({ balances });
  } catch (err) {
    console.error("get wallet balances error", err);
    return NextResponse.json(
      { error: "Failed to load balances" },
      { status: 500 }
    );
  }
}
