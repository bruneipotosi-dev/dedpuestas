import { listPlayersForAdmin } from "@/lib/admin/players";
import { updatePlayerStatusAction, setPlayerOptedOutAction } from "@/app/admin/actions";

export const metadata = { title: "Jugadores · Admin · Dedpuestas" };

const statusLabel: Record<string, string> = { alive: "Vivo", gulag: "Gulag", eliminated: "Eliminado" };
const nextStatuses: Record<string, { value: string; label: string }[]> = {
  alive: [
    { value: "gulag", label: "Enviar al Gulag" },
    { value: "eliminated", label: "Eliminar" },
  ],
  gulag: [
    { value: "alive", label: "Sale del Gulag (vivo)" },
    { value: "eliminated", label: "Eliminar" },
  ],
  eliminated: [{ value: "alive", label: "Revivir (corregir error)" }],
};

export default async function AdminJugadoresPage() {
  const players = await listPlayersForAdmin();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)", marginBottom: "var(--s-4)" }}>
        Estado de jugadores
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "var(--s-2) var(--s-3)",
              gap: "var(--s-2)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>{player.nick}</strong>{" "}
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-2)" }}>
                {player.team?.name ?? "Sin equipo"} · {statusLabel[player.status]}
                {player.optedOut && <span style={{ color: "var(--gulag-text)" }}> · Retirado (HU-24)</span>}
              </span>
            </div>
            <div style={{ display: "flex", gap: "var(--s-2)" }}>
              {nextStatuses[player.status]?.map((next) => (
                <form key={next.value} action={updatePlayerStatusAction}>
                  <input type="hidden" name="playerId" value={player.id} />
                  <input type="hidden" name="status" value={next.value} />
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
                    {next.label}
                  </button>
                </form>
              ))}
              <form action={setPlayerOptedOutAction}>
                <input type="hidden" name="playerId" value={player.id} />
                <input type="hidden" name="optedOut" value={(!player.optedOut).toString()} />
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "1px solid var(--line)",
                    color: "var(--text-2)",
                    borderRadius: "var(--r-md)",
                    padding: "var(--s-1) var(--s-2)",
                    fontSize: "var(--fs-xs)",
                    cursor: "pointer",
                  }}
                >
                  {player.optedOut ? "Quitar retiro" : "Marcar retirado (HU-24)"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
