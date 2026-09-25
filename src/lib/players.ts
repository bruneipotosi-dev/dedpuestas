import "server-only";
import { prisma } from "@/lib/prisma";

export type PlayerSentiment = { question: string; label: string; pct: number } | null;

/** Ficha pública de un jugador (HU-21): estado + qué opina la comunidad. */
export async function getPlayerProfile(slug: string) {
  const player = await prisma.player.findUnique({
    where: { slug },
    include: { team: true },
  });
  if (!player) return null;

  const market = await prisma.market.findFirst({
    where: { playerId: player.id, type: "muere_semana", status: "open" },
    include: { outcomes: true },
  });

  let sentiment: PlayerSentiment = null;
  if (market) {
    const totals = await prisma.bet.groupBy({
      by: ["outcomeId"],
      where: { outcome: { marketId: market.id } },
      _sum: { amount: true },
    });
    const pot = totals.reduce((sum, t) => sum + (t._sum.amount ?? 0n), 0n);
    const dies = market.outcomes.find((o) => o.label === "Muere");
    if (dies && pot > 0n) {
      const diesTotal = totals.find((t) => t.outcomeId === dies.id)?._sum.amount ?? 0n;
      const pct = Math.round((Number(diesTotal) / Number(pot)) * 100);
      sentiment = { question: market.question, label: "cree que muere esta semana", pct };
    }
  }

  return { player, sentiment };
}
