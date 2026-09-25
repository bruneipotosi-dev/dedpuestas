import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { getUserBalance } from "@/lib/ledger";
import { createWeeklyMarkets } from "@/lib/markets";
import { claimWeeklyRescue, canClaimWeeklyRescue } from "@/lib/bonus";
import { setPlayerOptedOut } from "@/lib/admin/players";

describe("v1: rescate semanal (HU-03) y retiro de streamer (HU-24)", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("no deja reclamar el rescate si el saldo no es cero", async () => {
    const result = await registerUser("rescate1", "milcontraseña");
    if (!result.ok) throw new Error("setup falló");

    const claim = await claimWeeklyRescue(result.userId);
    expect(claim).toEqual({ ok: false, reason: "balance_not_zero" });
  });

  it("permite reclamar el rescate cuando el saldo llega a cero", async () => {
    const prisma = await getTestPrisma();
    const result = await registerUser("rescate2", "milcontraseña");
    if (!result.ok) throw new Error("setup falló");

    // Vaciamos el saldo a mano con un ajuste, simulando que perdió todo.
    await prisma.ledgerEntry.create({
      data: { userId: result.userId, delta: -1000n, reason: "admin_adjustment" },
    });

    expect(await canClaimWeeklyRescue(result.userId, 0n)).toBe(true);

    const claim = await claimWeeklyRescue(result.userId);
    expect(claim.ok).toBe(true);

    const balance = await getUserBalance(result.userId);
    expect(balance).toBe(200n);
  });

  it("no da un segundo rescate en la misma semana", async () => {
    const prisma = await getTestPrisma();
    const result = await registerUser("rescate3", "milcontraseña");
    if (!result.ok) throw new Error("setup falló");

    await prisma.ledgerEntry.create({
      data: { userId: result.userId, delta: -1000n, reason: "admin_adjustment" },
    });
    await claimWeeklyRescue(result.userId); // saldo pasa a 200

    await prisma.ledgerEntry.create({
      data: { userId: result.userId, delta: -200n, reason: "admin_adjustment" },
    });
    const second = await claimWeeklyRescue(result.userId);
    expect(second).toEqual({ ok: false, reason: "already_claimed" });
  });

  it("un jugador retirado no recibe mercados nuevos (HU-24)", async () => {
    const prisma = await getTestPrisma();
    const team = await prisma.team.create({ data: { id: "topt", name: "T" } });
    const normal = await prisma.player.create({ data: { slug: "normal", nick: "Normal", teamId: team.id, status: "alive" } });
    const retirado = await prisma.player.create({ data: { slug: "retirado", nick: "Retirado", teamId: team.id, status: "alive" } });

    await setPlayerOptedOut(retirado.id, true);

    const result = await createWeeklyMarkets();
    expect(result.created).toBe(1);

    const markets = await prisma.market.findMany();
    expect(markets).toHaveLength(1);
    expect(markets[0].playerId).toBe(normal.id);
  });
});
