import "server-only";
import { prisma } from "@/lib/prisma";

/** Saldo de un usuario = SUM(delta) del libro de movimientos (RN-8). */
export async function getUserBalance(userId: string): Promise<bigint> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0n;
}
