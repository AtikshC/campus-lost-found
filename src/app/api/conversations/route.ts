import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";

function devMsg(e: any) {
  return process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error";
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
  where: { OR: [{ buyerId: user.id }, { ownerId: user.id }] },
  include: { post: { include: { images: true } }, owner: true, buyer: true },
  orderBy: { createdAt: "desc" },
});



    return NextResponse.json({ conversations });
  } catch (e: any) {
    console.error("GET /api/conversations failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}
