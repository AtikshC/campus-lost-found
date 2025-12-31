import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";

function devMsg(e: any) {
  return process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error";
}

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function getId(ctx: Ctx) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? (await p).id : p.id;
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const id = await getId(ctx);

    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversation = await prisma.conversation.findFirst({
      where: { id, OR: [{ buyerId: user.id }, { ownerId: user.id }] },
      include: {
        owner: true,
        buyer: true,
        post: { include: { images: true } },
      },
    });

    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ conversation });
  } catch (e: any) {
    console.error("GET /api/conversations/[id] failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const id = await getId(ctx);

    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const convo = await prisma.conversation.findFirst({
      where: { id, OR: [{ buyerId: user.id }, { ownerId: user.id }] },
      select: { id: true },
    });

    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.conversation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/conversations/[id] failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}
