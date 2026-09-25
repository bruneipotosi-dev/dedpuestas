import "server-only";
import { prisma } from "@/lib/prisma";

export type RankingEntry = { userId: string; username: string; balance: bigint };

/** Ranking por saldo total (HU-20). Solo fans: el admin no compite. */
export async function getRanking(limit = 100): Promise<RankingEntry[]> {
  const totals = await prisma.ledgerEntry.groupBy({
    by: ["userId"],
    _sum: { delta: true },
  });

  const fans = await prisma.user.findMany({ where: { role: "fan" }, select: { id: true, username: true } });
  const usernameById = new Map(fans.map((u) => [u.id, u.username]));

  return totals
    .filter((t) => usernameById.has(t.userId))
    .map((t) => ({
      userId: t.userId,
      username: usernameById.get(t.userId)!,
      balance: t._sum.delta ?? 0n,
    }))
    .sort((a, b) => (b.balance > a.balance ? 1 : b.balance < a.balance ? -1 : 0))
    .slice(0, limit);
}
