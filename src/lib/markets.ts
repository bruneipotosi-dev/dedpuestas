import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const MIN_BET = 10n;

export type PlaceBetResult =
  | { ok: true; betId: string }
  | { ok: false; reason: "min_amount" | "not_found" | "market_closed" | "insufficient_balance" };

/**
 * Apostar (HU-11). Bloquea la fila del usuario (FOR UPDATE) para serializar
 * sus apuestas concurrentes (RNF-2): dos apuestas simultáneas del mismo
 * usuario nunca dejan el saldo en negativo, porque la segunda espera a que
 * la primera termine su transacción antes de leer el saldo.
 */
export async function placeBet(
  userId: string,
  outcomeId: string,
  amount: bigint,
): Promise<PlaceBetResult> {
  if (amount < MIN_BET) return { ok: false, reason: "min_amount" };

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

    const outcome = await tx.outcome.findUnique({
      where: { id: outcomeId },
      include: { market: true },
    });
    if (!outcome) return { ok: false, reason: "not_found" };
    if (outcome.market.status !== "open" || outcome.market.closesAt <= new Date()) {
      return { ok: false, reason: "market_closed" };
    }

    const sum = await tx.ledgerEntry.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    const balance = sum._sum.delta ?? 0n;
    if (balance < amount) return { ok: false, reason: "insufficient_balance" };

    const bet = await tx.bet.create({ data: { userId, outcomeId, amount } });
    await tx.ledgerEntry.create({
      data: { userId, delta: -amount, reason: "bet", betId: bet.id, marketId: outcome.marketId },
    });

    return { ok: true, betId: bet.id };
  });
}

export type OpenMarket = Prisma.MarketGetPayload<{
  include: { player: { include: { team: true } }; outcomes: true };
}> & { outcomeTotals: Record<string, bigint>; pot: bigint };

/** Mercados abiertos con el % de Dedines por opción (HU-10). */
export async function getOpenMarkets(): Promise<OpenMarket[]> {
  const markets = await prisma.market.findMany({
    where: { status: "open" },
    include: {
      player: { include: { team: true } },
      outcomes: { orderBy: { sort: "asc" } },
    },
    orderBy: { closesAt: "asc" },
  });

  const results: OpenMarket[] = [];
  for (const market of markets) {
    const totals = await prisma.bet.groupBy({
      by: ["outcomeId"],
      where: { outcome: { marketId: market.id } },
      _sum: { amount: true },
    });
    const outcomeTotals: Record<string, bigint> = {};
    let pot = 0n;
    for (const outcome of market.outcomes) {
      const total = totals.find((t) => t.outcomeId === outcome.id)?._sum.amount ?? 0n;
      outcomeTotals[outcome.id] = total;
      pot += total;
    }
    results.push({ ...market, outcomeTotals, pot });
  }
  return results;
}

/** Apuestas de un usuario, abiertas y resueltas, con su resultado (HU-12). */
export async function getUserBets(userId: string) {
  return prisma.bet.findMany({
    where: { userId },
    include: {
      outcome: { include: { market: { include: { player: true } } } },
      ledgerEntries: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export type ResolveResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "already_resolved" };

/**
 * Resuelve un mercado en sistema parimutuel (HU-30, RN-4): el bote se
 * reparte entre los ganadores en proporción a lo apostado; la casa no se
 * queda nada. Bloquea la fila del mercado (FOR UPDATE) para que no se pueda
 * resolver dos veces en paralelo (RNF-2).
 */
export async function resolveMarket(
  marketId: string,
  winningOutcomeId: string,
  proofUrl?: string,
): Promise<ResolveResult> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ status: string }[]>`
      SELECT status FROM markets WHERE id = ${marketId} FOR UPDATE
    `;
    const market = rows[0];
    if (!market) return { ok: false, reason: "not_found" };
    if (market.status === "resolved" || market.status === "void") {
      return { ok: false, reason: "already_resolved" };
    }

    const bets = await tx.bet.findMany({ where: { outcome: { marketId } } });
    const pot = bets.reduce((sum, bet) => sum + bet.amount, 0n);
    const winnerBets = bets.filter((bet) => bet.outcomeId === winningOutcomeId);
    const winnerTotal = winnerBets.reduce((sum, bet) => sum + bet.amount, 0n);

    const entries: Prisma.LedgerEntryCreateManyInput[] = [];

    if (winnerTotal === 0n) {
      // RN-5: nadie acertó -> se devuelve lo apostado a todos.
      for (const bet of bets) {
        entries.push({ userId: bet.userId, delta: bet.amount, reason: "refund", betId: bet.id, marketId });
      }
    } else {
      let distributed = 0n;
      for (const bet of winnerBets) {
        const payout = (bet.amount * pot) / winnerTotal;
        distributed += payout;
        entries.push({ userId: bet.userId, delta: payout, reason: "payout", betId: bet.id, marketId });
      }
      const rounding = pot - distributed;
      if (rounding > 0n) {
        // El resto por redondeo hacia abajo se registra aparte para que el
        // libro cuadre exacto (RN-4: la casa no se queda nada).
        entries.push({ userId: winnerBets[0].userId, delta: rounding, reason: "rounding", marketId });
      }
    }

    if (entries.length > 0) {
      await tx.ledgerEntry.createMany({ data: entries });
    }

    await tx.market.update({
      where: { id: marketId },
      data: { status: "resolved", winningOutcomeId, proofUrl },
    });

    return { ok: true };
  });
}

/** Anula un mercado (RN-7): devuelve lo apostado a todos, sin ganador. */
export async function voidMarket(marketId: string): Promise<ResolveResult> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ status: string }[]>`
      SELECT status FROM markets WHERE id = ${marketId} FOR UPDATE
    `;
    const market = rows[0];
    if (!market) return { ok: false, reason: "not_found" };
    if (market.status === "resolved" || market.status === "void") {
      return { ok: false, reason: "already_resolved" };
    }

    const bets = await tx.bet.findMany({ where: { outcome: { marketId } } });
    if (bets.length > 0) {
      await tx.ledgerEntry.createMany({
        data: bets.map((bet) => ({
          userId: bet.userId,
          delta: bet.amount,
          reason: "refund" as const,
          betId: bet.id,
          marketId,
        })),
      });
    }

    await tx.market.update({ where: { id: marketId }, data: { status: "void" } });
    return { ok: true };
  });
}
