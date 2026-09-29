import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTransferForUser } from "@/lib/transfers";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const transfer = await getTransferForUser(user.id, id);
  if (!transfer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ transfer });
}
