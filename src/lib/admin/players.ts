import "server-only";
import { prisma } from "@/lib/prisma";
import type { PlayerStatus } from "@/generated/prisma/client";

/** Actualiza el estado de un jugador (HU-31): vivo → gulag → vivo | eliminado (RN-9). */
export async function updatePlayerStatus(playerId: number, status: PlayerStatus): Promise<void> {
  await prisma.player.update({
    where: { id: playerId },
    data: {
      status,
      eliminatedAt: status === "eliminated" ? new Date() : null,
    },
  });
}

/** Retiro de un streamer (HU-24): no se le crean mercados nuevos. */
export async function setPlayerOptedOut(playerId: number, optedOut: boolean): Promise<void> {
  await prisma.player.update({ where: { id: playerId }, data: { optedOut } });
}

export async function listPlayersForAdmin() {
  return prisma.player.findMany({
    include: { team: true },
    orderBy: [{ status: "asc" }, { nick: "asc" }],
  });
}
