import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { nextMarketCloseGmt6 } from "@/lib/time";

export const MIN_BET = 10n;

// Fin de temporada (data/seed-dedsafio4.json: endDate 2026-10-17, GMT-6).
const SEASON_END_GMT6 = new Date("2026-10-17T21:00:00.000Z"); // 15:00 GMT-6

type MarketTemplate = {
  type: string;
  status: Prisma.PlayerWhereInput["status"];
  question: (nick: string) => string;
  outcomes: [string, string];
};

async function createMarketsForTemplate(template: MarketTemplate): Promise<{ created: number }> {
  // RN: un jugador retirado (HU-24, optedOut) no recibe mercados nuevos.
  const players = await prisma.player.findMany({
    where: { status: template.status, optedOut: false },
  });
  const closesAt = nextMarketCloseGmt6();

  const existingOpen = await prisma.market.findMany({
    where: { type: template.type, status: "open", playerId: { in: players.map((p) => p.id) } },
    select: { playerId: true },
  });
  const alreadyHasMarket = new Set(existingOpen.map((m) => m.playerId));

  let created = 0;
  for (const player of players) {
    if (alreadyHasMarket.has(player.id)) continue;
    const market = await prisma.market.create({
      data: {
        playerId: player.id,
        type: template.type,
        question: template.question(player.nick),
        closesAt,
      },
    });
    await prisma.outcome.createMany({
      data: [
        { marketId: market.id, label: template.outcomes[0], sort: 0 },
        { marketId: market.id, label: template.outcomes[1], sort: 1 },
      ],
    });
    created++;
  }

  return { created };
}

/**
 * Botón "Crear mercados de la semana" (HU-30): genera "¿Muere esta semana?"
 * para todos los jugadores vivos que todavía no tengan uno abierto, con
 * cierre por defecto a las 15:00 GMT-6 (RN-6).
 */
export async function createWeeklyMarkets(): Promise<{ created: number }> {
  return createMarketsForTemplate({
    type: "muere_semana",
    status: "alive",
    question: (nick) => `¿${nick} muere esta semana?`,
    outcomes: ["Muere", "Sobrevive"],
  });
}

/** Mercados del Gulag (HU-13): para todos los jugadores que están en el Gulag. */
export async function createGulagMarkets(): Promise<{ created: number }> {
  return createMarketsForTemplate({
    type: "sale_gulag",
    status: "gulag",
    question: (nick) => `¿${nick} sale del Gulag?`,
    outcomes: ["Sale", "Se queda"],
  });
}

/**
 * Mercado por equipo (HU-14): una sola pregunta, un outcome por equipo.
 * Cierra al final de la temporada (ver data/seed-dedsafio4.json).
 */
export async function createTeamSurvivalMarket(): Promise<{ created: boolean }> {
  const existingOpen = await prisma.market.findFirst({
    where: { type: "equipo_sobrevive", status: "open" },
  });
  if (existingOpen) return { created: false };

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  if (teams.length === 0) return { created: false };

  const market = await prisma.market.create({
    data: {
      type: "equipo_sobrevive",
      question: "¿Qué equipo tendrá más sobrevivientes al final de la temporada?",
      closesAt: SEASON_END_GMT6,
    },
  });
  await prisma.outcome.createMany({
    data: teams.map((team, i) => ({ marketId: market.id, label: team.name, sort: i })),
  });
  return { created: true };
}

/** Mercado "más/menos" (HU-15): el admin define N y a qué se refiere. */
export async function createDeathCountMarket(
  threshold: number,
  question: string,
  closesAt: Date,
): Promise<{ created: boolean; error?: string }> {
  if (!Number.isInteger(threshold) || threshold < 0) {
    return { created: false, error: "El número tiene que ser un entero positivo." };
  }
  const market = await prisma.market.create({
    data: { type: "muertes_mas_menos", question, closesAt },
  });
  await prisma.outcome.createMany({
    data: [
      { marketId: market.id, label: `Más de ${threshold}`, sort: 0 },
      { marketId: market.id, label: `${threshold} o menos`, sort: 1 },
    ],
  });
  return { created: true };
}

export async function listMarketsForAdmin() {
  return prisma.market.findMany({
    include: { player: { include: { team: true } }, outcomes: true },
    orderBy: { closesAt: "desc" },
  });
}

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
}> & { outcomeTotals: Record<string, bigint>; pot: bigint; betCount: number };

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
      _count: true,
    });
    const outcomeTotals: Record<string, bigint> = {};
    let pot = 0n;
    let betCount = 0;
    for (const outcome of market.outcomes) {
      const row = totals.find((t) => t.outcomeId === outcome.id);
      outcomeTotals[outcome.id] = row?._sum.amount ?? 0n;
      pot += row?._sum.amount ?? 0n;
      betCount += row?._count ?? 0;
    }
    results.push({ ...market, outcomeTotals, pot, betCount });
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
