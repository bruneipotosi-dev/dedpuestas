import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlayerProfile } from "@/lib/players";
import { getCurrentUser } from "@/lib/session";
import { ReportForm } from "./report-form";

const statusLabel: Record<string, string> = { alive: "Vivo", gulag: "Gulag", eliminated: "Eliminado" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) return { title: "Jugador no encontrado · Dedpuestas" };

  const { player, sentiment } = profile;
  const description = sentiment
    ? `El ${sentiment.pct}% de la comunidad ${sentiment.label} en Dedpuestas.`
    : `Seguí a ${player.nick} en Dedpuestas, la web de fans de Dedsafio 4.`;

  return {
    title: `${player.nick} · Dedpuestas`,
    description,
    openGraph: { title: `${player.nick} · Dedpuestas`, description },
  };
}

export default async function JugadorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [profile, user] = await Promise.all([getPlayerProfile(slug), getCurrentUser()]);
  if (!profile) notFound();

  const { player, sentiment } = profile;

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "var(--s-6) var(--s-4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--s-3)",
        textAlign: "center",
      }}
    >
      {player.avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- avatar externo (mc-heads.net)
        <img
          src={player.avatarUrl}
          alt={player.nick}
          width={96}
          height={96}
          style={{ borderRadius: "var(--r-lg)" }}
        />
      )}
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-2xl)" }}>{player.nick}</h1>
      <p style={{ color: "var(--text-2)" }}>
        {player.team?.name ?? "Sin equipo"} · {statusLabel[player.status]}
      </p>

      {sentiment ? (
        <p style={{ fontSize: "var(--fs-lg)" }} className="num">
          El <strong style={{ color: "var(--die-text)" }}>{sentiment.pct}%</strong> de la comunidad{" "}
          {sentiment.label}
        </p>
      ) : (
        <p style={{ color: "var(--text-2)" }}>Todavía no hay apuestas abiertas sobre {player.nick}.</p>
      )}

      {user && <ReportForm playerId={player.id} />}
    </main>
  );
}
