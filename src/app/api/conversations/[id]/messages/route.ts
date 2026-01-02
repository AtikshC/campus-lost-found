import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";
import { randomUUID } from "crypto";

function devMsg(e: any) {
  return process.env.NODE_ENV === "development"
    ? String(e?.message ?? e)
    : "Server error";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (e: any) {
    console.error("GET /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const content = String((body as any)?.content ?? "").trim();
    if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

    const message = await prisma.message.create({
    data: {
      id: randomUUID(),              // ✅ add this
      conversationId: id,
      senderId: user.id,
      content,
      createdAt: new Date(),       // only add if your schema requires it
    },
    include: { sender: true },
  });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}
