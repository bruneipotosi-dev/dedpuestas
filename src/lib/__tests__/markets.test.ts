import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { getUserBalance } from "@/lib/ledger";
import { placeBet, resolveMarket, voidMarket } from "@/lib/markets";

async function makeUser(username: string) {
  const result = await registerUser(username, "milcontraseña");
  if (!result.ok) throw new Error("no se pudo crear el usuario de test");
  return result.userId;
}

async function makeMarket(closesInMs = 60 * 60 * 1000) {
  const prisma = await getTestPrisma();
  const team = await prisma.team.create({ data: { id: `team-${Date.now()}-${Math.random()}`, name: "Test Team" } });
  const player = await prisma.player.create({
    data: { slug: `player-${Date.now()}-${Math.random()}`, nick: "Testeador", teamId: team.id },
  });
  const market = await prisma.market.create({
    data: {
      playerId: player.id,
      type: "muere_semana",
      question: "¿Muere esta semana?",
      closesAt: new Date(Date.now() + closesInMs),
    },
  });
  const [si, no] = await Promise.all([
    prisma.outcome.create({ data: { marketId: market.id, label: "Sí", sort: 0 } }),
    prisma.outcome.create({ data: { marketId: market.id, label: "No", sort: 1 } }),
  ]);
  return { market, si, no };
}

describe("markets", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("permite apostar dentro del saldo disponible", async () => {
    const userId = await makeUser("apostador1");
    const { si } = await makeMarket();

    const result = await placeBet(userId, si.id, 300n);
    expect(result.ok).toBe(true);

    const balance = await getUserBalance(userId);
    expect(balance).toBe(700n); // 1000 de bono - 300 apostados
  });

  it("rechaza apostar más del saldo disponible (RN-3)", async () => {
    const userId = await makeUser("apostador2");
    const { si } = await makeMarket();

    const result = await placeBet(userId, si.id, 5000n);
    expect(result).toEqual({ ok: false, reason: "insufficient_balance" });
  });

  it("rechaza apostar bajo el mínimo de 10 (RN-3)", async () => {
    const userId = await makeUser("apostador3");
    const { si } = await makeMarket();

    const result = await placeBet(userId, si.id, 5n);
    expect(result).toEqual({ ok: false, reason: "min_amount" });
  });

  it("rechaza apostar en un mercado cerrado (RN-6)", async () => {
    const userId = await makeUser("apostador4");
    const { si } = await makeMarket(-1000); // closesAt en el pasado

    const result = await placeBet(userId, si.id, 100n);
    expect(result).toEqual({ ok: false, reason: "market_closed" });
  });

  it("nunca deja el saldo negativo con apuestas concurrentes del mismo usuario (RNF-2)", async () => {
    const userId = await makeUser("apostador5");
    const { si, no } = await makeMarket();

    // Dos apuestas de 700 en paralelo; el saldo es 1000, así que una sola
    // puede entrar. La otra debe fallar por saldo insuficiente, nunca las dos.
    const [r1, r2] = await Promise.all([
      placeBet(userId, si.id, 700n),
      placeBet(userId, no.id, 700n),
    ]);

    const results = [r1, r2];
    const succeeded = results.filter((r) => r.ok);
    expect(succeeded).toHaveLength(1);

    const balance = await getUserBalance(userId);
    expect(balance).toBeGreaterThanOrEqual(0n);
    expect(balance).toBe(300n);
  });

  it("reparte el bote en proporción a lo apostado (RN-4, parimutuel)", async () => {
    const alice = await makeUser("alice");
    const bob = await makeUser("bob");
    const carol = await makeUser("carol");
    const { si, no } = await makeMarket();

    await placeBet(alice, si.id, 100n); // gana
    await placeBet(bob, si.id, 300n); // gana
    await placeBet(carol, no.id, 200n); // pierde

    const marketId = await getMarketIdFromOutcome(si.id);
    const result = await resolveMarket(marketId, si.id);
    expect(result.ok).toBe(true);

    // Bote total = 600. Ganadores: alice 100/400, bob 300/400.
    const aliceBalance = await getUserBalance(alice);
    const bobBalance = await getUserBalance(bob);
    const carolBalance = await getUserBalance(carol);

    // alice: 1000 - 100 + payout; payout = floor(100 * 600 / 400) = 150
    expect(aliceBalance).toBe(1000n - 100n + 150n);
    // bob: 1000 - 300 + floor(300*600/400)=450
    expect(bobBalance).toBe(1000n - 300n + 450n);
    // carol perdió, no recibe nada.
    expect(carolBalance).toBe(1000n - 200n);
  });

  it("devuelve lo apostado a todos si nadie acierta (RN-5)", async () => {
    const alice = await makeUser("alice2");
    const { si, no } = await makeMarket();

    await placeBet(alice, si.id, 200n);

    const marketId = await getMarketIdFromOutcome(si.id);
    await resolveMarket(marketId, no.id); // gana "no", pero nadie apostó a "no"

    const balance = await getUserBalance(alice);
    expect(balance).toBe(1000n); // reembolso completo
  });

  it("no permite resolver el mismo mercado dos veces, ni en paralelo (RNF-2)", async () => {
    const alice = await makeUser("alice3");
    const { si, no } = await makeMarket();
    await placeBet(alice, si.id, 100n);
    const marketId = await getMarketIdFromOutcome(si.id);

    const [r1, r2] = await Promise.all([
      resolveMarket(marketId, si.id),
      resolveMarket(marketId, no.id),
    ]);

    const results = [r1, r2];
    const succeeded = results.filter((r) => r.ok);
    expect(succeeded).toHaveLength(1);

    const again = await resolveMarket(marketId, si.id);
    expect(again).toEqual({ ok: false, reason: "already_resolved" });
  });

  it("anula un mercado y devuelve todo lo apostado (RN-7)", async () => {
    const alice = await makeUser("alice4");
    const { si } = await makeMarket();
    await placeBet(alice, si.id, 250n);
    const marketId = await getMarketIdFromOutcome(si.id);

    const result = await voidMarket(marketId);
    expect(result.ok).toBe(true);

    const balance = await getUserBalance(alice);
    expect(balance).toBe(1000n);
  });
});

async function getMarketIdFromOutcome(outcomeId: string): Promise<string> {
  const prisma = await getTestPrisma();
  const outcome = await prisma.outcome.findUniqueOrThrow({ where: { id: outcomeId } });
  return outcome.marketId;
}
