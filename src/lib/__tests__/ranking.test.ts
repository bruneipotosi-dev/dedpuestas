import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { placeBet, resolveMarket } from "@/lib/markets";
import { getRanking } from "@/lib/ranking";

describe("ranking (HU-20)", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("ordena por saldo total descendente", async () => {
    const prisma = await getTestPrisma();
    const alice = await registerUser("alicer", "milcontraseña");
    const bob = await registerUser("bobr", "milcontraseña");
    if (!alice.ok || !bob.ok) throw new Error("setup falló");

    const team = await prisma.team.create({ data: { id: "tr1", name: "T" } });
    const player = await prisma.player.create({ data: { slug: "pr1", nick: "P1", teamId: team.id } });
    const market = await prisma.market.create({
      data: { playerId: player.id, type: "muere_semana", question: "?", closesAt: new Date(Date.now() + 3600_000) },
    });
    const si = await prisma.outcome.create({ data: { marketId: market.id, label: "Sí", sort: 0 } });
    const no = await prisma.outcome.create({ data: { marketId: market.id, label: "No", sort: 1 } });

    await placeBet(alice.userId, no.id, 300n); // alice pierde
    await placeBet(bob.userId, si.id, 500n); // bob gana
    await resolveMarket(market.id, si.id); // bob se lleva todo el bote (800)

    const ranking = await getRanking();
    const [first, second] = ranking;
    expect(first.username).toBe("bobr");
    expect(first.balance).toBe(1300n); // 1000 - 500 + 800
    expect(second.username).toBe("alicer");
    expect(second.balance).toBe(700n); // 1000 - 300, perdió
  });

  it("desempata saldos iguales por username, de forma determinística", async () => {
    await registerUser("zoe", "milcontraseña");
    await registerUser("ana", "milcontraseña");

    // Ambas se quedan con el bono de 1000 sin apostar: saldos empatados.
    const ranking = await getRanking();
    expect(ranking.map((r) => r.username)).toEqual(["ana", "zoe"]);
  });

  it("no incluye al admin en el ranking", async () => {
    const prisma = await getTestPrisma();
    await prisma.user.create({
      data: {
        username: "admin",
        role: "admin",
        authIdentities: { create: { provider: "password", passwordHash: "x" } },
      },
    });
    await registerUser("fan1", "milcontraseña");

    const ranking = await getRanking();
    expect(ranking.map((r) => r.username)).toEqual(["fan1"]);
  });
});
