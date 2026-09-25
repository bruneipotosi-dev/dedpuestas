import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hash } from "@node-rs/argon2";
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

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminUsername && adminPassword) {
    const username = adminUsername.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      const passwordHash = await hash(adminPassword, {
        algorithm: 2,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
      await prisma.user.create({
        data: {
          username,
          role: "admin",
          authIdentities: {
            create: { provider: "password", passwordHash },
          },
        },
      });
      console.log(`Admin creado: ${username}`);
    } else {
      console.log(`Admin "${username}" ya existía, no se tocó.`);
    }
  } else {
    console.log("ADMIN_USERNAME/ADMIN_PASSWORD no definidos: no se crea admin.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
