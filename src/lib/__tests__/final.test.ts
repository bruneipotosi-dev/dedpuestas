import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { createTeamSurvivalMarket, createDeathCountMarket, placeBet, resolveMarket } from "@/lib/markets";
import { getUserBalance } from "@/lib/ledger";
import { createReport } from "@/lib/reports";
import { listReportsForAdmin, markReportReviewed } from "@/lib/admin/reports";

describe("HU-14 mercado por equipo", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("crea un mercado con un outcome por equipo", async () => {
    const prisma = await getTestPrisma();
    await prisma.team.createMany({
      data: [
        { id: "eq1", name: "Equipo 1" },
        { id: "eq2", name: "Equipo 2" },
      ],
    });

    const result = await createTeamSurvivalMarket();
    expect(result.created).toBe(true);

    const market = await prisma.market.findFirstOrThrow({ include: { outcomes: true } });
    expect(market.playerId).toBeNull();
    expect(market.outcomes.map((o) => o.label).sort()).toEqual(["Equipo 1", "Equipo 2"]);
  });

  it("no crea dos mercados por equipo abiertos a la vez", async () => {
    const prisma = await getTestPrisma();
    await prisma.team.create({ data: { id: "eq3", name: "Equipo 3" } });

    await createTeamSurvivalMarket();
    const second = await createTeamSurvivalMarket();
    expect(second.created).toBe(false);

    const count = await prisma.market.count();
    expect(count).toBe(1);
  });

  it("se puede apostar y resolver un mercado por equipo igual que cualquier otro", async () => {
    const prisma = await getTestPrisma();
    await prisma.team.createMany({ data: [{ id: "eq4", name: "A" }, { id: "eq5", name: "B" }] });
    await createTeamSurvivalMarket();

    const market = await prisma.market.findFirstOrThrow({ include: { outcomes: true } });
    const winnerOutcome = market.outcomes.find((o) => o.label === "A")!;

    const alice = await registerUser("equipofan", "milcontraseña");
    if (!alice.ok) throw new Error("setup falló");
    await placeBet(alice.userId, winnerOutcome.id, 300n);

    const resolved = await resolveMarket(market.id, winnerOutcome.id);
    expect(resolved.ok).toBe(true);

    const balance = await getUserBalance(alice.userId);
    expect(balance).toBe(1000n); // único apostador, se lleva todo el bote (300)
  });
});

describe("HU-15 mercado de número de muertes", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("crea el mercado con los outcomes más de N / N o menos", async () => {
    const prisma = await getTestPrisma();
    const closesAt = new Date(Date.now() + 3600_000);

    const result = await createDeathCountMarket(3, "¿Más de 3 muertes el sábado?", closesAt);
    expect(result.created).toBe(true);

    const market = await prisma.market.findFirstOrThrow({ include: { outcomes: true } });
    expect(market.playerId).toBeNull();
    expect(market.outcomes.map((o) => o.label).sort()).toEqual(["3 o menos", "Más de 3"]);
  });

  it("rechaza un umbral negativo", async () => {
    const result = await createDeathCountMarket(-1, "¿Más de -1 muertes?", new Date());
    expect(result.created).toBe(false);
  });
});

describe("HU-32 reportes de la comunidad", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("un fan reporta una muerte y el admin la puede marcar revisada", async () => {
    const prisma = await getTestPrisma();
    const team = await prisma.team.create({ data: { id: "eqr", name: "T" } });
    const player = await prisma.player.create({ data: { slug: "reportado", nick: "Reportado", teamId: team.id } });
    const fan = await registerUser("reportero", "milcontraseña");
    if (!fan.ok) throw new Error("setup falló");

    await createReport(fan.userId, player.id, "https://clips.example.com/1", "murió en el directo");

    const reports = await listReportsForAdmin();
    expect(reports).toHaveLength(1);
    expect(reports[0].reviewed).toBe(false);
    expect(reports[0].player.nick).toBe("Reportado");

    await markReportReviewed(reports[0].id);
    const updated = await listReportsForAdmin();
    expect(updated[0].reviewed).toBe(true);
  });
});
