import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTransferForUser } from "@/lib/transfers";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const transfer = await getTransferForUser(session.user.id, id);
  if (!transfer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ transfer });
}
