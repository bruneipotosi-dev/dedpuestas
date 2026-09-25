import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export function hashPassword(password: string): Promise<string> {
  // Parámetros argon2id recomendados por OWASP para uso interactivo.
  return hash(password, {
    algorithm: 2 /* argon2id */,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export type LoginResult =
  | { ok: true; userId: string; mustChangePassword: boolean }
  | { ok: false; reason: "not_found" | "locked" | "bad_password" };

/**
 * Verifica usuario/contraseña aplicando el bloqueo de 5 intentos / 15 min
 * (HU-01). El username se normaliza a minúsculas al comparar y al registrar.
 */
export async function attemptLogin(
  username: string,
  password: string,
): Promise<LoginResult> {
  const identity = await prisma.authIdentity.findFirst({
    where: {
      provider: "password",
      user: { username: username.toLowerCase() },
    },
    include: { user: true },
  });

  if (!identity || !identity.passwordHash) {
    return { ok: false, reason: "not_found" };
  }

  if (identity.lockedUntil && identity.lockedUntil > new Date()) {
    return { ok: false, reason: "locked" };
  }

  const valid = await verify(identity.passwordHash, password);

  if (!valid) {
    const failedLoginCount = identity.failedLoginCount + 1;
    const locked = failedLoginCount >= MAX_FAILED_ATTEMPTS;
    await prisma.authIdentity.update({
      where: { id: identity.id },
      data: {
        failedLoginCount: locked ? 0 : failedLoginCount,
        lockedUntil: locked ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });
    return { ok: false, reason: locked ? "locked" : "bad_password" };
  }

  await prisma.authIdentity.update({
    where: { id: identity.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  return {
    ok: true,
    userId: identity.userId,
    mustChangePassword: identity.mustChangePassword,
  };
}
