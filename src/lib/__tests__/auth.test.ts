import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { attemptLogin } from "@/lib/auth";
import { getUserBalance } from "@/lib/ledger";

describe("auth", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("registra un usuario nuevo con el bono de 1000 Dedines (RN-2)", async () => {
    const result = await registerUser("Erickzzxc", "contraseñasegura");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const balance = await getUserBalance(result.userId);
    expect(balance).toBe(1000n);
  });

  it("no permite usernames duplicados, sin importar mayúsculas/minúsculas", async () => {
    await registerUser("Sapnap", "contraseñasegura");
    const second = await registerUser("sapnap", "otracontraseña");
    expect(second.ok).toBe(false);
  });

  it("permite loguearse con las credenciales correctas", async () => {
    await registerUser("conterstine", "milcontraseña");
    const result = await attemptLogin("conterstine", "milcontraseña");
    expect(result.ok).toBe(true);
  });

  it("rechaza una contraseña incorrecta sin bloquear antes de 5 intentos", async () => {
    await registerUser("yoyiyoniu", "milcontraseña");
    const result = await attemptLogin("yoyiyoniu", "incorrecta");
    expect(result).toEqual({ ok: false, reason: "bad_password" });
  });

  it("bloquea la cuenta 15 minutos tras 5 intentos fallidos (HU-01)", async () => {
    await registerUser("nuvia", "milcontraseña");

    for (let i = 0; i < 4; i++) {
      const attempt = await attemptLogin("nuvia", "incorrecta");
      expect(attempt).toEqual({ ok: false, reason: "bad_password" });
    }

    const fifth = await attemptLogin("nuvia", "incorrecta");
    expect(fifth).toEqual({ ok: false, reason: "locked" });

    // Ni siquiera la contraseña correcta entra mientras está bloqueada.
    const withCorrectPassword = await attemptLogin("nuvia", "milcontraseña");
    expect(withCorrectPassword).toEqual({ ok: false, reason: "locked" });
  });
});
