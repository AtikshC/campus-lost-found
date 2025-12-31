import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/lib/matchScore";
import { PostStatus, PostType } from "@prisma/client";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id?: string; postId?: string }> }
) {
  try {
    const { id, postId } = await ctx.params; // ✅ unwrap params Promise (Next 16+)
    const pid = id ?? postId;

    if (!pid) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: pid } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const counterpartType: PostType = post.type === PostType.LOST ? PostType.FOUND : PostType.LOST;

    const candidates = await prisma.post.findMany({
  where: {
    type: counterpartType,
    ...( { status: PostStatus.OPEN } as any ),
  },
  take: 80,
  orderBy: { createdAt: "desc" },
  include: { images: true, createdBy: true },
});


    const scored = candidates
      .map((c) => ({ ...c, ...computeMatch(post, c) }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 8);

    return NextResponse.json({ matches: scored });
  } catch (e: any) {
    console.error("GET /api/matches/[id] failed:", e);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? String(e?.message ?? e)
            : "Server error",
      },
      { status: 500 }
    );
  }
}
