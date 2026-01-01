import { NextResponse } from "next/server";
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
    select: { id: true, ownerId: true, buyerId: true },
  });

  if (!convo) return { ok: false as const, status: 404, error: "Conversation not found" };
  const isMember = convo.ownerId === userId || convo.buyerId === userId;
  if (!isMember) return { ok: false as const, status: 403, error: "Forbidden" };

  return { ok: true as const, convo };
}

// GET /api/conversations/:id/messages  -> list messages
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await requireMember(params.id, user.id);
    if (!member.ok) {
      return NextResponse.json({ error: member.error }, { status: member.status });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true } }, // optional
      },
    });

    return NextResponse.json({ messages });
  } catch (e: any) {
    console.error("GET /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}

// POST /api/conversations/:id/messages -> create a message
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await requireMember(params.id, user.id);
    if (!member.ok) {
      return NextResponse.json({ error: member.error }, { status: member.status });
    }

    const body = await req.json().catch(() => ({}));
    const content = String(body?.content ?? "").trim();

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: user.id,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } }, // optional
      },
    });

    // optional: bump conversation updatedAt if you rely on it for inbox sorting
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations/[id]/messages failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}
