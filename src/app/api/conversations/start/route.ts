import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";
import { ensureUser } from "@/lib/userSync";
import { randomUUID } from "crypto";

function devMsg(e: any) {
  return process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error";
}

export async function POST(req: Request) {
  try {
    // your authserver reads Supabase cookies
    const user = await getUserFromRequest(req.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const postId = body?.postId;
    const ownerId = body?.ownerId;

    if (!postId || !ownerId) {
      return NextResponse.json({ error: "Missing postId/ownerId" }, { status: 400 });
    }

    const buyerId = user.id;

    if (buyerId === ownerId) {
      return NextResponse.json({ error: "You can't message your own post." }, { status: 400 });
    }

    // ✅ ensure buyer exists in Prisma User table (fixes buyerId FK)
    await ensureUser({ id: user.id, email: user.email });

    // ✅ validate post exists + get owner email (helps fix ownerId FK too)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        createdById: true,
        createdBy: { select: { id: true, email: true } },
      },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.createdById !== ownerId) {
      return NextResponse.json({ error: "Owner mismatch" }, { status: 400 });
    }

    // ✅ ensure owner exists in Prisma User table (fixes ownerId FK)
    if (post.createdBy?.email) {
      await ensureUser({ id: post.createdBy.id, email: post.createdBy.email });
    }

    const conversation = await prisma.conversation.upsert({
      where: { postId_ownerId_buyerId: { postId, ownerId, buyerId } },
      update: {},
      create: {
        id: randomUUID(), // ✅ required if your schema has no default
        postId,
        ownerId,
        buyerId,
        // createdAt: new Date(), // uncomment if your schema requires createdAt with no default
      },
      include: {
        post: { include: { images: true } },
        owner: true,
        buyer: true,
      },
    });

    return NextResponse.json({ conversation });
  } catch (e: any) {
    console.error("POST /api/conversations/start failed:", e);
    return NextResponse.json({ error: devMsg(e) }, { status: 500 });
  }
}
