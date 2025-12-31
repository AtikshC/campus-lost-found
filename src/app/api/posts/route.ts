import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/authserver";
import { ensureUser } from "@/lib/userSync";
import { randomUUID } from "crypto";
import { Category } from "@prisma/client";


export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      take: 80,
      orderBy: { createdAt: "desc" },
      include: { images: true, createdBy: true },
    });

    return NextResponse.json({ posts });
  } catch (e: any) {
    console.error("GET /api/posts failed:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const user = await getUserFromRequest(auth);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: "No email on user" }, { status: 400 });

    await ensureUser({ id: user.id, email: user.email });

    const body = await req.json();

const {
  type,
  title,
  description = "",
  category = "OTHER",
  locationText = "Unknown",
  dateOccurred,
  imageUrls = [],
} = body ?? {};

    if (!type || !title) {
      return NextResponse.json({ error: "Missing fields (type, title)" }, { status: 400 });
    }


    const post = await prisma.post.create({
  data: {
    id: randomUUID(),
    type,
    title,
    description: String(description).trim(),
    category: Category.OTHER,
    locationText: String(locationText).trim() || "Unknown",
    dateOccurred: dateOccurred ? new Date(dateOccurred) : new Date(),
    createdById: user.id,
    images: {
      create: (imageUrls as string[]).map((url) => ({ url })),
    },
  },
  include: { images: true, createdBy: true },
});


    return NextResponse.json({ post }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/posts failed:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : "Server error" },
      { status: 500 }
    );
  }
}
