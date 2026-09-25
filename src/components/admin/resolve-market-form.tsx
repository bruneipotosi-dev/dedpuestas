"use client";

import { useActionState } from "react";
import { resolveMarketAction, voidMarketAction, type ResolveFormState } from "@/app/admin/actions";

type Props = {
  marketId: string;
  outcomes: { id: string; label: string }[];
};

const initialState: ResolveFormState = { error: null };

export function ResolveMarketForm({ marketId, outcomes }: Props) {
  const [state, formAction, pending] = useActionState(resolveMarketAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)", marginTop: "var(--s-2)" }}>
      <form action={formAction} style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
        <input type="hidden" name="marketId" value={marketId} />
        <select
          name="winningOutcomeId"
          required
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            color: "var(--text)",
            padding: "var(--s-1) var(--s-2)",
          }}
        >
          {outcomes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="url"
          name="proofUrl"
          placeholder="Link al clip (opcional)"
          style={{
            flex: 1,
            minWidth: 160,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            color: "var(--text)",
            padding: "var(--s-1) var(--s-2)",
          }}
        />
        <button
          type="submit"
          disabled={pending}
          style={{
            background: "var(--live)",
            color: "var(--bg)",
            border: "none",
            borderRadius: "var(--r-md)",
            padding: "var(--s-1) var(--s-3)",
            cursor: "pointer",
          }}
        >
          Resolver
        </button>
      </form>

      <form action={voidMarketAction}>
        <input type="hidden" name="marketId" value={marketId} />
        <button
          type="submit"
          style={{
            background: "none",
            border: "1px solid var(--line)",
            color: "var(--text-2)",
            borderRadius: "var(--r-md)",
            padding: "var(--s-1) var(--s-3)",
            cursor: "pointer",
          }}
        >
          Anular mercado
        </button>
      </form>

      {state.error && <p style={{ color: "var(--error-text)", fontSize: "var(--fs-sm)", margin: 0 }}>{state.error}</p>}
    </div>
  );
}
