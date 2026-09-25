const GMT6_OFFSET_MS = 6 * 60 * 60 * 1000;

/** Medianoche de "hoy" en GMT-6 (RN-2), como instante UTC. */
export function startOfTodayGmt6(at: Date = new Date()): Date {
  const local = new Date(at.getTime() - GMT6_OFFSET_MS);
  const localMidnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(localMidnight + GMT6_OFFSET_MS);
}

/** Próximo cierre por defecto: 15:00 GMT-6, hoy si no pasó, si no mañana (RN-6). */
export function nextMarketCloseGmt6(at: Date = new Date()): Date {
  const todayAt15 = new Date(startOfTodayGmt6(at).getTime() + 15 * 60 * 60 * 1000);
  return todayAt15 > at ? todayAt15 : new Date(todayAt15.getTime() + 24 * 60 * 60 * 1000);
}
