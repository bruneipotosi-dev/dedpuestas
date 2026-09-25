import { listMarketsForAdmin } from "@/lib/markets";
import { createWeeklyMarketsAction } from "@/app/admin/actions";
import { ResolveMarketForm } from "@/components/admin/resolve-market-form";

export const metadata = { title: "Mercados · Admin · Dedpuestas" };

const statusLabel: Record<string, string> = {
  open: "Abierto",
  closed: "Cerrado",
  resolved: "Resuelto",
  void: "Anulado",
};

export default async function AdminMercadosPage() {
  const markets = await listMarketsForAdmin();
  const open = markets.filter((m) => m.status === "open" || m.status === "closed");
  const done = markets.filter((m) => m.status === "resolved" || m.status === "void");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" }}>Mercados</h1>
        <form action={createWeeklyMarketsAction}>
          <button
            type="submit"
            style={{
              background: "var(--brand)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "var(--r-lg)",
              padding: "var(--s-2) var(--s-3)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Crear mercados de la semana
          </button>
        </form>
      </div>

      <section>
        <h2 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--s-2)" }}>Abiertos / cerrados</h2>
        {open.length === 0 && <p style={{ color: "var(--text-2)" }}>No hay mercados abiertos.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          {open.map((market) => (
            <article key={market.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "var(--s-3)" }}>
              <strong>{market.question}</strong>{" "}
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--pending-text)" }}>
                {statusLabel[market.status]} · cierra {market.closesAt.toLocaleString("es-MX")}
              </span>
              <ResolveMarketForm
                marketId={market.id}
                outcomes={market.outcomes.map((o) => ({ id: o.id, label: o.label }))}
              />
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--s-2)" }}>Resueltos / anulados</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
          {done.map((market) => (
            <div key={market.id} style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>
              {market.question} — {statusLabel[market.status]}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
