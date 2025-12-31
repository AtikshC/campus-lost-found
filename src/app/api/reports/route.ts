import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";
import { ensureUser } from "@/lib/userSync";
import { z } from "zod";
import { randomUUID } from "crypto";

const ReportSchema = z.object({
  postId: z.string(),
  reason: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  const user = await getUserFromRequest(req.headers.get("authorization")); // ✅ cookie-based
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureUser({ id: user.id, email: user.email });

  const body = await req.json().catch(() => null);
  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      id: randomUUID(), // ✅ required if schema has no default
      postId: parsed.data.postId,
      reporterId: user.id,
      reason: parsed.data.reason,
      // createdAt: new Date(), // uncomment if your schema requires createdAt with no default
    },
  });

  return NextResponse.json({ report });
}

export async function GET() {
  const reports = await prisma.report.findMany({
    include: { post: true, reporter: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reports });
}
