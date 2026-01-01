import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";

function devMsg(e: any) {
  return process.env.NODE_ENV === "development"
    ? String(e?.message ?? e)
    : "Server error";
}

async function requireMember(conversationId: string, userId: string) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { ownerId: true, buyerId: true },
  });
  if (!convo) return { ok: false as const, status: 404, error: "Conversation not found" };
  if (convo.ownerId !== userId && convo.buyerId !== userId) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }
  return { ok: true as const };
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

    const member = await requireMember(id, user.id);
    if (!member.ok) return NextResponse.json({ error: member.error }, { status: member.status });

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

    const member = await requireMember(id, user.id);
    if (!member.ok) return NextResponse.json({ error: member.error }, { status: member.status });

    const body = await req.json().catch(() => ({} as any));
    const content = String((body as any)?.content ?? "").trim();
    if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

    const message = await prisma.message.create({
      data: { conversationId: id, senderId: user.id, content },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}
