"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { attemptLogin } from "@/lib/auth";
import { registerUser } from "@/lib/users";
import { createSession, destroySession } from "@/lib/session";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";

export type ActionState = { error: string | null };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await clientIp();
  // Límite de registros por IP (HU-01): frena la creación masiva de cuentas.
  if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Demasiados registros desde tu conexión. Probá más tarde." };
  }

  const captchaOk = await verifyTurnstile(formData.get("cf-turnstile-response"));
  if (!captchaOk) {
    return { error: "No pudimos verificar que sos una persona. Probá de nuevo." };
  }

  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const result = await registerUser(parsed.data.username, parsed.data.password);
  if (!result.ok) {
    return { error: "Ese usuario ya existe." };
  }

  await createSession(result.userId);
  redirect("/");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const captchaOk = await verifyTurnstile(formData.get("cf-turnstile-response"));
  if (!captchaOk) {
    return { error: "No pudimos verificar que sos una persona. Probá de nuevo." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Completá usuario y contraseña." };
  }

  const result = await attemptLogin(username, password);
  if (!result.ok) {
    if (result.reason === "locked") {
      return { error: "Cuenta bloqueada por 15 minutos por demasiados intentos fallidos." };
    }
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession(result.userId);
  redirect(result.mustChangePassword ? "/cambiar-password" : "/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
