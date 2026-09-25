import { listReportsForAdmin } from "@/lib/admin/reports";
import { markReportReviewedAction } from "@/app/admin/actions";

export const metadata = { title: "Reportes · Admin · Dedpuestas" };

export default async function AdminReportesPage() {
  const reports = await listReportsForAdmin();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)", marginBottom: "var(--s-4)" }}>
        Reportes de la comunidad
      </h1>
      {reports.length === 0 && <p style={{ color: "var(--text-2)" }}>No hay reportes.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "var(--s-3)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "var(--s-2) var(--s-3)",
              opacity: report.reviewed ? 0.5 : 1,
            }}
          >
            <div style={{ fontSize: "var(--fs-sm)" }}>
              <strong>{report.player.nick}</strong> · reportado por {report.user.username} ·{" "}
              <a href={report.clipUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-text)" }}>
                ver clip
              </a>
              {report.note && <div style={{ color: "var(--text-2)", fontSize: "var(--fs-xs)" }}>{report.note}</div>}
            </div>
            {!report.reviewed && (
              <form action={markReportReviewedAction}>
                <input type="hidden" name="reportId" value={report.id} />
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                    borderRadius: "var(--r-md)",
                    padding: "var(--s-1) var(--s-2)",
                    fontSize: "var(--fs-xs)",
                    cursor: "pointer",
                  }}
                >
                  Marcar revisado
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
