import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserBets } from "@/lib/markets";
import { getSiteOrigin } from "@/lib/site-url";

function shareUrl(origin: string, playerSlug: string, question: string, outcomeLabel: string): string {
  const playerUrl = `${origin}/jugador/${playerSlug}`;
  const text = `Aposté en Dedpuestas: "${question}" → ${outcomeLabel}. ¿Vos qué creés?`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(playerUrl)}`;
}

export const metadata = { title: "Mis apuestas · Dedpuestas" };

function resultLabel(bet: Awaited<ReturnType<typeof getUserBets>>[number]): {
  text: string;
  color: string;
} {
  const marketStatus = bet.outcome.market.status;
  if (marketStatus === "open" || marketStatus === "closed") {
    return { text: "Pendiente", color: "var(--pending-text)" };
  }
  const won = bet.ledgerEntries.find((e) => e.reason === "payout" || e.reason === "refund");
  if (marketStatus === "void" || won?.reason === "refund") {
    return { text: "Anulada · reembolsada", color: "var(--text-2)" };
  }
  if (won) {
    return { text: `Ganaste ${won.delta.toString()}`, color: "var(--live-text)" };
  }
  return { text: "Perdiste", color: "var(--die-text)" };
}

export default async function MisApuestasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [bets, origin] = await Promise.all([getUserBets(user.id), getSiteOrigin()]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--s-4)", width: "100%" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)", marginBottom: "var(--s-4)" }}>
        Mis apuestas
      </h1>

      {bets.length === 0 && <p style={{ color: "var(--text-2)" }}>Todavía no apostaste nada.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        {bets.map((bet) => {
          const result = resultLabel(bet);
          return (
            <article
              key={bet.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-lg)",
                padding: "var(--s-3)",
                gap: "var(--s-3)",
              }}
            >
              <div>
                <div>{bet.outcome.market.question}</div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-2)" }}>
                  {bet.outcome.market.player.nick} · Apostaste a &quot;{bet.outcome.label}&quot; ·{" "}
                  <span className="num">{bet.amount.toString()}</span> Dedines
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--s-1)" }}>
                <span style={{ color: result.color, fontSize: "var(--fs-sm)", whiteSpace: "nowrap" }} className="num">
                  {result.text}
                </span>
                <a
                  href={shareUrl(origin, bet.outcome.market.player.slug, bet.outcome.market.question, bet.outcome.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "var(--fs-xs)", color: "var(--brand-text)" }}
                >
                  Compartir en X
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
