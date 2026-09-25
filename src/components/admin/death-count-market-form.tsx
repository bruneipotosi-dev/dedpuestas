"use client";

import { useActionState } from "react";
import { createDeathCountMarketAction, type DeathCountFormState } from "@/app/admin/actions";

const initialState: DeathCountFormState = { error: null };

export function DeathCountMarketForm() {
  const [state, formAction, pending] = useActionState(createDeathCountMarketAction, initialState);

  return (
    <form
      action={formAction}
      style={{
        display: "flex",
        gap: "var(--s-2)",
        flexWrap: "wrap",
        alignItems: "center",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-3)",
      }}
    >
      <input
        type="text"
        name="question"
        placeholder='Pregunta, ej: "¿Habrá más de 3 muertes el sábado?"'
        required
        style={{
          flex: 1,
          minWidth: 220,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-md)",
          color: "var(--text)",
          padding: "var(--s-2)",
        }}
      />
      <input
        type="number"
        name="threshold"
        placeholder="N"
        min={0}
        required
        style={{
          width: 80,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-md)",
          color: "var(--text)",
          padding: "var(--s-2)",
        }}
      />
      <input
        type="datetime-local"
        name="closesAt"
        required
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-md)",
          color: "var(--text)",
          padding: "var(--s-2)",
        }}
      />
      <button
        type="submit"
        disabled={pending}
        style={{
          background: "var(--pending)",
          color: "var(--bg)",
          border: "none",
          borderRadius: "var(--r-md)",
          padding: "var(--s-2) var(--s-3)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Crear mercado de muertes
      </button>
      {state.error && <p style={{ color: "var(--error-text)", fontSize: "var(--fs-xs)", width: "100%", margin: 0 }}>{state.error}</p>}
    </form>
  );
}
