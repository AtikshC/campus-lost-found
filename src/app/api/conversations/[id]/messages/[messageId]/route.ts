import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await context.params;

    const user = await getUserFromRequest(req.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const convo = await prisma.conversation.findUnique({
      where: { id },
      select: { ownerId: true, buyerId: true },
    });
    if (!convo) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    if (convo.ownerId !== user.id && convo.buyerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.findFirst({
      where: { id: messageId, conversationId: id },
      include: { sender: true },
    });
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    return NextResponse.json({ message });
  } catch (e: any) {
    console.error("GET /api/conversations/[id]/messages/[messageId] failed:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
