import "server-only";
import { prisma } from "@/lib/prisma";

const DAILY_BONUS = 100n;
const WEEKLY_RESCUE = 200n;
const GMT6_OFFSET_MS = 6 * 60 * 60 * 1000;

/** Medianoche de "hoy" en GMT-6 (RN-2), como instante UTC. */
function startOfTodayGmt6(): Date {
  const local = new Date(Date.now() - GMT6_OFFSET_MS);
  const localMidnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(localMidnight + GMT6_OFFSET_MS);
}

export type ClaimResult = { ok: true } | { ok: false; reason: "already_claimed" };

/**
 * Bono diario (HU-02). Bloquea la fila del usuario para que dos clics
 * seguidos (o dos pestañas) no den dos bonos el mismo día.
 */
export async function claimDailyBonus(userId: string): Promise<ClaimResult> {
  const todayStart = startOfTodayGmt6();

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

    const alreadyClaimed = await tx.ledgerEntry.findFirst({
      where: { userId, reason: "daily_bonus", createdAt: { gte: todayStart } },
    });
    if (alreadyClaimed) return { ok: false, reason: "already_claimed" };

    await tx.ledgerEntry.create({
      data: { userId, delta: DAILY_BONUS, reason: "daily_bonus" },
    });
    return { ok: true };
  });
}

export async function hasClaimedToday(userId: string): Promise<boolean> {
  const entry = await prisma.ledgerEntry.findFirst({
    where: { userId, reason: "daily_bonus", createdAt: { gte: startOfTodayGmt6() } },
  });
  return entry !== null;
}

/**
 * Rescate semanal (HU-03, v1): 200 Dedines una vez por semana si el saldo
 * llegó a cero. No se usa todavía en el MVP; queda listo para HU-03.
 */
export async function claimWeeklyRescue(userId: string): Promise<ClaimResult> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

    const sum = await tx.ledgerEntry.aggregate({ where: { userId }, _sum: { delta: true } });
    if ((sum._sum.delta ?? 0n) > 0n) return { ok: false, reason: "already_claimed" };

    const lastRescue = await tx.ledgerEntry.findFirst({
      where: { userId, reason: "weekly_rescue", createdAt: { gte: weekAgo } },
    });
    if (lastRescue) return { ok: false, reason: "already_claimed" };

    await tx.ledgerEntry.create({
      data: { userId, delta: WEEKLY_RESCUE, reason: "weekly_rescue" },
    });
    return { ok: true };
  });
}
