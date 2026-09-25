"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { passwordSchema } from "@/lib/validation";
import type { ActionState } from "@/app/(auth)/actions";

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Contraseña inválida." };
  }

  const passwordHash = await hashPassword(parsed.data);

  await prisma.authIdentity.updateMany({
    where: { userId: user.id, provider: "password" },
    data: { passwordHash, mustChangePassword: false, failedLoginCount: 0, lockedUntil: null },
  });

  redirect("/");
}
