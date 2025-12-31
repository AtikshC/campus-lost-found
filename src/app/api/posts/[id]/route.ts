import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";
import { ensureUser } from "@/lib/userSync";
import { PostStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";


export async function GET(_: Request, ctx: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { images: true, createdBy: true },
    });

    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ post });
  } catch (e: any) {
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureUser({ id: user.id, email: user.email });

    const body = await req.json().catch(() => ({}));
    const status = body?.status as PostStatus | undefined;

    if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.createdById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: { status } as any,
      include: { images: true, createdBy: true },
    });

    return NextResponse.json({ post });
  } catch (e: any) {
    console.error("PATCH /api/posts/[id] failed:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

    const auth = _.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureUser({ id: user.id, email: user.email });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.createdById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/posts/[id] failed:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error" },
      { status: 500 }
    );
  }
}
