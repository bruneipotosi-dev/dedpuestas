import { getCurrentUser } from "@/lib/session";
import { getRanking } from "@/lib/ranking";

export const metadata = { title: "Ranking · Dedpuestas" };

export default async function RankingPage() {
  const [user, ranking] = await Promise.all([getCurrentUser(), getRanking()]);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "var(--s-4)", width: "100%" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)", marginBottom: "var(--s-4)" }}>
        Ranking de pronosticadores
      </h1>

      {ranking.length === 0 && <p style={{ color: "var(--text-2)" }}>Todavía no hay apostadores.</p>}

      <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
        {ranking.map((entry, i) => (
          <li
            key={entry.userId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--s-2) var(--s-3)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--line)",
              background: user?.id === entry.userId ? "var(--surface)" : "transparent",
            }}
          >
            <span>
              <span className="num" style={{ color: "var(--text-2)", marginRight: "var(--s-2)" }}>
                #{i + 1}
              </span>
              {entry.username}
              {user?.id === entry.userId && (
                <span style={{ color: "var(--brand-text)", fontSize: "var(--fs-xs)" }}> (vos)</span>
              )}
            </span>
            <span className="num" style={{ color: "var(--dedines)" }}>
              {entry.balance.toString()} Dedines
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
