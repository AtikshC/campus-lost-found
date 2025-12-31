import { prisma } from "@/lib/prisma";

export async function ensureUser(user: { id: string; email?: string }) {
  if (!user.email) throw new Error("No email on user.");

  return prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email },
  });
}
