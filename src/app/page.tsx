import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getUserBalance } from "@/lib/ledger";
import { getOpenMarkets } from "@/lib/markets";
import { hasClaimedToday } from "@/lib/bonus";
import { prisma } from "@/lib/prisma";
import { BetForm } from "@/components/bet-form";
import { DailyBonusButton } from "@/components/daily-bonus-button";

function teamColor(teamId: string | null | undefined): string {
  if (teamId === "team-mafia") return "var(--team-mafia-text)";
  if (teamId === "team-minitas") return "var(--team-minitas-text)";
  return "var(--team-other-text)";
}

function pct(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

type SearchParams = { team?: string; q?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { team: teamFilter, q } = await searchParams;
  const user = await getCurrentUser();
  const now = new Date().getTime();

  const [balance, markets, claimedToday, teams] = await Promise.all([
    user ? getUserBalance(user.id) : Promise.resolve(null),
    getOpenMarkets(),
    user ? hasClaimedToday(user.id) : Promise.resolve(false),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  const filtered = markets.filter((m) => {
    if (teamFilter && m.player.teamId !== teamFilter) return false;
    if (q && !m.player.nick.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--s-4)", width: "100%" }}>
      {user && !claimedToday && (
        <div style={{ marginBottom: "var(--s-4)" }}>
          <DailyBonusButton />
        </div>
      )}

      <form
        method="get"
        style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-4)", flexWrap: "wrap" }}
      >
        <input
          type="text"
          name="q"
          placeholder="Buscar jugador..."
          defaultValue={q ?? ""}
          style={{
            flex: 1,
            minWidth: 160,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            color: "var(--text)",
            padding: "var(--s-2)",
          }}
        />
        <select
          name="team"
          defaultValue={teamFilter ?? ""}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            color: "var(--text)",
            padding: "var(--s-2)",
          }}
        >
          <option value="">Todos los equipos</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            color: "var(--text)",
            padding: "var(--s-2) var(--s-3)",
            cursor: "pointer",
          }}
        >
          Filtrar
        </button>
      </form>

      {filtered.length === 0 && (
        <p style={{ color: "var(--text-2)" }}>No hay mercados abiertos con ese filtro.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
        {filtered.map((market) => {
          const closesInH = Math.max(0, Math.round((market.closesAt.getTime() - now) / (1000 * 60 * 60)));
          return (
            <article
              key={market.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--r-xl)",
                padding: "var(--s-4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--s-2)" }}>
                <div>
                  <strong>{market.player.nick}</strong>{" "}
                  <span style={{ color: teamColor(market.player.teamId), fontSize: "var(--fs-xs)" }}>
                    {market.player.team?.name ?? "Sin equipo"}
                  </span>
                </div>
                <span style={{ fontSize: "var(--fs-xs)", color: "var(--pending-text)" }}>
                  Cierra en {closesInH}h
                </span>
              </div>

              <p style={{ margin: "var(--s-2) 0" }}>{market.question}</p>

              <div style={{ display: "flex", gap: "var(--s-3)", fontSize: "var(--fs-sm)" }}>
                {market.outcomes.map((o) => (
                  <span key={o.id} className="num" style={{ color: "var(--text-2)" }}>
                    {o.label}: {pct(market.outcomeTotals[o.id], market.pot)}%
                  </span>
                ))}
                <span className="num" style={{ marginLeft: "auto", color: "var(--dedines)" }}>
                  Bote: {market.pot.toString()}
                </span>
              </div>

              {user && balance !== null ? (
                <BetForm
                  outcomes={market.outcomes.map((o) => ({ id: o.id, label: o.label }))}
                  outcomeTotals={Object.fromEntries(
                    Object.entries(market.outcomeTotals).map(([k, v]) => [k, v.toString()]),
                  )}
                  pot={market.pot.toString()}
                  balance={balance.toString()}
                />
              ) : (
                <p style={{ fontSize: "var(--fs-sm)", marginTop: "var(--s-2)" }}>
                  <Link href="/login" style={{ color: "var(--brand-text)" }}>
                    Iniciá sesión
                  </Link>{" "}
                  para apostar.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
