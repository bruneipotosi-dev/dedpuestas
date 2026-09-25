import "server-only";
import { headers } from "next/headers";

/**
 * Origen absoluto del sitio para armar links compartibles (HU-22). Sin
 * dominio propio todavía (ver docs/01-brief.md), así que lo deducimos de los
 * headers de la request en vez de hardcodear uno.
 */
export async function getSiteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
