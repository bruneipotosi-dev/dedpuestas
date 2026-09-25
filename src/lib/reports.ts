import "server-only";
import { prisma } from "@/lib/prisma";

/** Un fan reporta una muerte con un link al clip (HU-32). No cambia nada solo. */
export async function createReport(userId: string, playerId: number, clipUrl: string, note?: string) {
  return prisma.report.create({
    data: { userId, playerId, clipUrl, note: note?.trim() || null },
  });
}
