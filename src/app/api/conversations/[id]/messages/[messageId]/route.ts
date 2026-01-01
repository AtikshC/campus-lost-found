import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";
import { randomUUID } from "crypto";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await getUserFromRequest(req.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    // must be participant
    if (conversation.ownerId !== user.id && conversation.buyerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
      take: 200,
    });

    return NextResponse.json({ messages });
  } catch (e: any) {
    console.error("GET /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await getUserFromRequest(req.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ✅ ensure sender exists
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: { id: user.id, email: user.email },
    });

    const body = await req.json();
    const content = String(body?.content ?? "").trim();
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    if (conversation.ownerId !== user.id && conversation.buyerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        id: randomUUID(), // ✅ REQUIRED
        content,
        conversationId: id,
        senderId: user.id,
        createdAt: new Date(),
      },
      include: { sender: true },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
