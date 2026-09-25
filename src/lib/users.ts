import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const SIGNUP_BONUS = 1000n;

export type RegisterResult = { ok: true; userId: string } | { ok: false; reason: "taken" };

/** Crea el usuario, su credencial y el bono inicial de RN-2, todo en una transacción. */
export async function registerUser(username: string, password: string): Promise<RegisterResult> {
  const normalized = username.toLowerCase();
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { username: normalized, role: "fan" },
      });
      await tx.authIdentity.create({
        data: { userId: created.id, provider: "password", passwordHash },
      });
      await tx.ledgerEntry.create({
        data: { userId: created.id, delta: SIGNUP_BONUS, reason: "signup_bonus" },
      });
      return created;
    });
    return { ok: true, userId: user.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, reason: "taken" };
    }
    throw error;
  }
}
