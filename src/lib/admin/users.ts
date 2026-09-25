import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getUserBalance } from "@/lib/ledger";

const TEMP_PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateTempPassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TEMP_PASSWORD_CHARS[randomInt(TEMP_PASSWORD_CHARS.length)];
  }
  return out;
}

export async function listUsersForAdmin() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return Promise.all(
    users.map(async (user) => ({ ...user, balance: await getUserBalance(user.id) })),
  );
}

export type ResetPasswordResult = { ok: true; tempPassword: string } | { ok: false; reason: "not_found" };

/**
 * Restablece la contraseña de un usuario (HU-33): genera una temporal que
 * tendrá que cambiar al entrar (mustChangePassword). Sin email, esta es la
 * única forma de recuperar el acceso.
 */
export async function resetUserPassword(userId: string): Promise<ResetPasswordResult> {
  const identity = await prisma.authIdentity.findFirst({
    where: { userId, provider: "password" },
  });
  if (!identity) return { ok: false, reason: "not_found" };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.authIdentity.update({
    where: { id: identity.id },
    data: { passwordHash, mustChangePassword: true, failedLoginCount: 0, lockedUntil: null },
  });

  return { ok: true, tempPassword };
}
