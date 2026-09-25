import Link from "next/link";
import type { CSSProperties } from "react";
import { getCurrentUser } from "@/lib/session";
import { getUserBalance } from "@/lib/ledger";
import { getOpenMarkets } from "@/lib/markets";
import { hasClaimedToday, canClaimWeeklyRescue } from "@/lib/bonus";
import { prisma } from "@/lib/prisma";
import { BetForm } from "@/components/bet-form";
import { DailyBonusButton } from "@/components/daily-bonus-button";
import { WeeklyRescueButton } from "@/components/weekly-rescue-button";
import { WelcomeHero } from "@/components/welcome-hero";
import { PlayerAvatar } from "@/components/player-avatar";
import { OutcomeBar } from "@/components/outcome-bar";
import { DedinIcon } from "@/components/dedin-icon";

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
  const canRescue = user && balance !== null ? await canClaimWeeklyRescue(user.id, balance) : false;

  const filtered = markets.filter((m) => {
    if (teamFilter && m.player?.teamId !== teamFilter) return false;
    if (q && !m.player?.nick.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const chipStyle = (active: boolean): CSSProperties => ({
    flex: "none",
    whiteSpace: "nowrap",
    fontSize: "var(--fs-sm)",
    fontWeight: 600,
    padding: "var(--s-2) var(--s-3)",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--brand)" : "var(--line)"}`,
    background: active ? "var(--surface)" : "transparent",
    color: active ? "var(--brand-text)" : "var(--text)",
    textDecoration: "none",
  });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {!user && <WelcomeHero />}

      <div style={{ padding: "0 var(--s-4) var(--s-4)" }}>
        {user && !claimedToday && (
          <div style={{ marginBottom: "var(--s-2)" }}>
            <DailyBonusButton />
          </div>
        )}
        {canRescue && (
          <div style={{ marginBottom: "var(--s-4)" }}>
            <WeeklyRescueButton />
          </div>
        )}

        <div style={{ margin: user ? "var(--s-4) 0 var(--s-3)" : "0 0 var(--s-3)" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" }}>
            ¿Quién cae esta semana?
          </h2>
          <p style={{ margin: 0, color: "var(--text-2)", fontSize: "var(--fs-sm)" }}>
            {filtered.length} mercado{filtered.length === 1 ? "" : "s"} abierto{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--s-2)",
            overflowX: "auto",
            paddingBottom: "var(--s-2)",
            marginBottom: "var(--s-2)",
          }}
        >
          <Link href="/" style={chipStyle(!teamFilter)}>
            Todos
          </Link>
          {teams.map((t) => (
            <Link key={t.id} href={`/?team=${t.id}`} style={chipStyle(teamFilter === t.id)}>
              {t.name}
            </Link>
          ))}
        </div>

        <form method="get" style={{ marginBottom: "var(--s-4)" }}>
          {teamFilter && <input type="hidden" name="team" value={teamFilter} />}
          <input
            type="text"
            name="q"
            placeholder="Buscar jugador..."
            defaultValue={q ?? ""}
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 999,
              color: "var(--text)",
              padding: "var(--s-2) var(--s-4)",
            }}
          />
        </form>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--s-8) var(--s-4)",
              border: "1px dashed var(--line)",
              borderRadius: "var(--r-xl)",
              color: "var(--text-2)",
            }}
          >
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", color: "var(--text)" }}>
              Nadie por aquí
            </p>
            <p style={{ margin: "var(--s-1) 0 0" }}>Ningún mercado coincide con este filtro.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          {filtered.map((market) => {
            const closesInH = Math.max(0, Math.round((market.closesAt.getTime() - now) / (1000 * 60 * 60)));
            const closesLabel = closesInH >= 24 ? `${Math.round(closesInH / 24)}d` : `${closesInH}h`;
            const [first, second] = market.outcomes;
            const firstPct = first ? pct(market.outcomeTotals[first.id], market.pot) : 0;
            const secondPct = second ? pct(market.outcomeTotals[second.id], market.pot) : 0;
            const leadIsFirst = firstPct >= secondPct;
            const lead = leadIsFirst ? first : second;
            const leadPct = leadIsFirst ? firstPct : secondPct;
            const leadColor = lead?.label === "Muere" ? "var(--die-text)" : "var(--live-text)";

            return (
              <article
                key={market.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-xl)",
                  padding: "var(--s-4)",
                  display: "grid",
                  gap: "var(--s-3)",
                }}
              >
                <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
                  {market.player && (
                    <PlayerAvatar avatarUrl={market.player.avatarUrl} nick={market.player.nick} size={40} />
                  )}
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
                    <strong style={{ fontSize: "var(--fs-md)" }}>{market.player?.nick ?? "Dedsafio 4"}</strong>
                    {market.player && (
                      <div style={{ fontSize: "var(--fs-xs)", color: teamColor(market.player.teamId) }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            background: teamColor(market.player.teamId),
                            marginRight: 6,
                            borderRadius: 2,
                          }}
                        />
                        {market.player.team?.name ?? "Sin equipo"}
                      </div>
                    )}
                  </div>
                  <span
                    className="num"
                    style={{
                      fontSize: "var(--fs-xs)",
                      fontWeight: 600,
                      color: "var(--pending-text)",
                      background: "var(--bg)",
                      border: "1px solid var(--pending-border)",
                      borderRadius: "var(--r-md)",
                      padding: "var(--s-1) var(--s-2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Cierra en {closesLabel}
                  </span>
                </div>

                <p style={{ margin: 0, color: "var(--text-2)", fontSize: "var(--fs-sm)" }}>{market.question}</p>

                {market.outcomes.length === 2 && (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--s-2)" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--s-2)" }} className="num">
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-2xl)", color: leadColor }}>
                          {leadPct}%
                        </span>
                        <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: leadColor }}>
                          {lead?.label}
                        </span>
                      </div>
                      <span className="num" style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>
                        {leadIsFirst ? secondPct : firstPct}% {leadIsFirst ? second?.label : first?.label}
                      </span>
                    </div>
                    <OutcomeBar
                      diePct={first?.label === "Muere" ? firstPct : secondPct}
                      livePct={first?.label === "Muere" ? secondPct : firstPct}
                    />
                  </>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>
                  <span className="num" style={{ display: "flex", alignItems: "center", gap: "var(--s-1)", color: "var(--text)", fontWeight: 600 }}>
                    <DedinIcon size={14} /> {market.pot.toString()}
                  </span>
                  <span>{market.betCount} apuesta{market.betCount === 1 ? "" : "s"}</span>
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
                  <Link
                    href="/login"
                    style={{
                      textAlign: "center",
                      background: "var(--text)",
                      color: "var(--bg)",
                      fontWeight: 700,
                      padding: "var(--s-2)",
                      borderRadius: "var(--r-md)",
                      textDecoration: "none",
                      fontSize: "var(--fs-sm)",
                    }}
                  >
                    Iniciá sesión para apostar
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
