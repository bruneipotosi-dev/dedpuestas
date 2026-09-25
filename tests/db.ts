import { execSync } from "node:child_process";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@/generated/prisma/client";

let container: StartedPostgreSqlContainer | undefined;
let client: PrismaClient | undefined;

/**
 * Levanta un Postgres 17 descartable (Testcontainers) una sola vez por
 * proceso de test, le aplica las migraciones reales y devuelve un
 * PrismaClient apuntando a esa base. Se reusa entre archivos de test porque
 * vitest.config.ts corre todo en un solo fork (singleFork).
 */
export async function getTestPrisma(): Promise<PrismaClient> {
  if (client) return client;

  container = await new PostgreSqlContainer("postgres:17-alpine").start();
  const url = container.getConnectionUri();
  // Lo exponemos también como process.env para que el singleton de
  // src/lib/prisma.ts (usado por el código de la app que los tests importan)
  // apunte a esta misma base descartable.
  process.env.DATABASE_URL = url;

  execSync("npx prisma migrate deploy", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });

  client = new PrismaClient({ datasourceUrl: url });
  return client;
}

export async function resetDb(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.ledgerEntry.deleteMany(),
    prisma.bet.deleteMany(),
    prisma.outcome.deleteMany(),
    prisma.market.deleteMany(),
    prisma.session.deleteMany(),
    prisma.authIdentity.deleteMany(),
    prisma.user.deleteMany(),
    prisma.player.deleteMany(),
    prisma.team.deleteMany(),
  ]);
}
