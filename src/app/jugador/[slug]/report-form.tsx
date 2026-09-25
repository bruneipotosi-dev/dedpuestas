"use client";

import { useActionState, useState } from "react";
import { createReportAction, type ReportFormState } from "./actions";

const initialState: ReportFormState = { error: null };

export function ReportForm({ playerId }: { playerId: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createReportAction, initialState);

  if (state.success) {
    return <p style={{ color: "var(--live-text)", fontSize: "var(--fs-sm)" }}>Gracias, lo reportaste.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "1px solid var(--line)",
          color: "var(--text-2)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-1) var(--s-3)",
          fontSize: "var(--fs-xs)",
          cursor: "pointer",
        }}
      >
        Reportar una muerte
      </button>
    );
  }

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)", width: "100%", maxWidth: 320 }}
    >
      <input type="hidden" name="playerId" value={playerId} />
      <input
        type="url"
        name="clipUrl"
        placeholder="Link al clip"
        required
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-md)",
          color: "var(--text)",
          padding: "var(--s-2)",
          fontSize: "var(--fs-sm)",
        }}
      />
      {state.error && <p style={{ color: "var(--error-text)", fontSize: "var(--fs-xs)", margin: 0 }}>{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        style={{
          background: "var(--brand)",
          color: "var(--bg)",
          border: "none",
          borderRadius: "var(--r-md)",
          padding: "var(--s-2)",
          fontSize: "var(--fs-sm)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {pending ? "Enviando..." : "Enviar reporte"}
      </button>
    </form>
  );
}
