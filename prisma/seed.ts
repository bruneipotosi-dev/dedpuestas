import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, PlayerStatus } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

type SeedPlayer = {
  id: number;
  slug: string;
  nick: string;
  teamId: string | null;
  kickChannel: string | null;
  trackerStreamerSlug: string | null;
  avatarUrl: string | null;
  status: string;
  eliminatedAt: string | null;
};

type SeedData = {
  teams: { id: string; name: string }[];
  players: SeedPlayer[];
};

async function main() {
  const path = join(__dirname, "..", "data", "seed-dedsafio4.json");
  const data: SeedData = JSON.parse(readFileSync(path, "utf-8"));

  for (const team of data.teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: { name: team.name },
      create: { id: team.id, name: team.name },
    });
  }
  console.log(`Equipos cargados: ${data.teams.length}`);

  for (const player of data.players) {
    await prisma.player.upsert({
      where: { id: player.id },
      update: {
        slug: player.slug,
        nick: player.nick,
        teamId: player.teamId,
        kickChannel: player.kickChannel,
        trackerStreamerSlug: player.trackerStreamerSlug,
        avatarUrl: player.avatarUrl,
        status: player.status as PlayerStatus,
        eliminatedAt: player.eliminatedAt ? new Date(player.eliminatedAt) : null,
      },
      create: {
        id: player.id,
        slug: player.slug,
        nick: player.nick,
        teamId: player.teamId,
        kickChannel: player.kickChannel,
        trackerStreamerSlug: player.trackerStreamerSlug,
        avatarUrl: player.avatarUrl,
        status: player.status as PlayerStatus,
        eliminatedAt: player.eliminatedAt ? new Date(player.eliminatedAt) : null,
      },
    });
  }
  console.log(`Jugadores cargados: ${data.players.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
