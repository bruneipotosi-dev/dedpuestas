import "server-only";

/**
 * Verifica un token de Cloudflare Turnstile. Si TURNSTILE_SECRET_KEY no está
 * configurada (desarrollo local, o mientras no exista el dominio en
 * Cloudflare), no bloquea: deja pasar y loguea un aviso. En producción
 * completá .env con las claves reales — ver .env.example.
 */
export async function verifyTurnstile(token: FormDataEntryValue | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY no configurada; se omite la verificación (modo dev).");
    return true;
  }

  if (!token || typeof token !== "string") return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );

  const data = (await response.json()) as { success: boolean };
  return data.success;
}
