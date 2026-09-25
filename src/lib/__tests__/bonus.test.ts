import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { getUserBalance } from "@/lib/ledger";
import { claimDailyBonus } from "@/lib/bonus";

describe("bonus diario (HU-02)", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("acredita 100 Dedines la primera vez del día", async () => {
    const result = await registerUser("bonuser1", "milcontraseña");
    if (!result.ok) throw new Error("setup falló");

    const claim = await claimDailyBonus(result.userId);
    expect(claim.ok).toBe(true);

    const balance = await getUserBalance(result.userId);
    expect(balance).toBe(1100n); // 1000 de registro + 100 de bono
  });

  it("no da un segundo bono el mismo día", async () => {
    const result = await registerUser("bonuser2", "milcontraseña");
    if (!result.ok) throw new Error("setup falló");

    await claimDailyBonus(result.userId);
    const second = await claimDailyBonus(result.userId);
    expect(second).toEqual({ ok: false, reason: "already_claimed" });

    const balance = await getUserBalance(result.userId);
    expect(balance).toBe(1100n);
  });

  it("dos clics seguidos (concurrentes) no dan dos bonos", async () => {
    const result = await registerUser("bonuser3", "milcontraseña");
    if (!result.ok) throw new Error("setup falló");

    const [a, b] = await Promise.all([
      claimDailyBonus(result.userId),
      claimDailyBonus(result.userId),
    ]);
    const succeeded = [a, b].filter((r) => r.ok);
    expect(succeeded).toHaveLength(1);

    const balance = await getUserBalance(result.userId);
    expect(balance).toBe(1100n);
  });
});
