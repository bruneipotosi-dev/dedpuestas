import { getTestPrisma } from "./db";

// Levanta el Postgres descartable y fija DATABASE_URL antes de que cualquier
// archivo de test importe código de la app (que usa el prisma singleton).
await getTestPrisma();
