import "server-only";

/**
 * Limitador en memoria (un solo proceso Node, ver ADR-0001 monolito). Alcanza
 * para el despliegue actual; si algún día hay más de una instancia de la app,
 * esto necesita moverse a algo compartido (ej. Postgres o Redis).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
