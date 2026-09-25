"use client";

import { useActionState, useMemo, useState } from "react";
import { placeBetAction, type BetActionState } from "@/app/(markets)/actions";

type Outcome = { id: string; label: string };

type Props = {
  outcomes: Outcome[];
  outcomeTotals: Record<string, string>; // bigint serializado a string
  pot: string;
  balance: string;
};

const initialState: BetActionState = { error: null };

function outcomeColors(label: string): { text: string; bg: string; border: string } {
  if (label === "Muere") return { text: "var(--die-text)", bg: "var(--die-soft)", border: "var(--die-border)" };
  if (label === "Sobrevive") return { text: "var(--live-text)", bg: "var(--live-soft)", border: "var(--live-border)" };
  return { text: "var(--brand-text)", bg: "var(--surface)", border: "var(--line)" };
}

export function BetForm({ outcomes, outcomeTotals, pot, balance }: Props) {
  const [selected, setSelected] = useState(outcomes[0]?.id ?? "");
  const [amount, setAmount] = useState("10");
  const [state, formAction, pending] = useActionState(placeBetAction, initialState);

  const potN = BigInt(pot);

  const estimate = useMemo(() => {
    const amountN = BigInt(Number.isFinite(Number(amount)) && amount !== "" ? Math.max(0, Math.floor(Number(amount))) : 0);
    if (amountN <= 0n) return null;
    const outcomeTotalN = BigInt(outcomeTotals[selected] ?? "0");
    const newPot = potN + amountN;
    const newOutcomeTotal = outcomeTotalN + amountN;
    // Si el mercado cerrara ahora mismo, con nadie más apostando (HU-11).
    const payout = (amountN * newPot) / newOutcomeTotal;
    return payout;
  }, [amount, selected, potN, outcomeTotals]);

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}
    >
      <input type="hidden" name="outcomeId" value={selected} />
      <div style={{ display: "flex", gap: "var(--s-2)" }}>
        {outcomes.map((o) => {
          const colors = outcomeColors(o.label);
          const p = potN > 0n ? Math.round((Number(BigInt(outcomeTotals[o.id] ?? "0")) / Number(potN)) * 100) : 0;
          const isSelected = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              style={{
                flex: 1,
                display: "grid",
                gap: 4,
                textAlign: "left",
                padding: "var(--s-2) var(--s-3)",
                borderRadius: "var(--r-md)",
                border: `2px solid ${isSelected ? colors.border : "var(--line)"}`,
                background: isSelected ? colors.bg : "transparent",
                color: isSelected ? colors.text : "var(--text)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {o.label}
              </span>
              <span className="num" style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" }}>
                {p}%
              </span>
            </button>
          );
        })}
      </div>

      <input
        type="number"
        name="amount"
        min={10}
        step={10}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-md)",
          color: "var(--text)",
          padding: "var(--s-2)",
        }}
      />

      <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-2)", margin: 0 }}>
        Saldo: <span className="num">{balance}</span> Dedines
        {estimate !== null && (
          <>
            {" · "}Ganarías <span className="num" style={{ color: "var(--dedines)" }}>{estimate.toString()}</span> si
            cerrara ahora
          </>
        )}
      </p>

      {state.error && (
        <p style={{ color: "var(--error-text)", fontSize: "var(--fs-sm)", margin: 0 }}>{state.error}</p>
      )}
      {state.success && (
        <p style={{ color: "var(--live-text)", fontSize: "var(--fs-sm)", margin: 0 }}>¡Apuesta hecha!</p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          background: "var(--brand)",
          color: "var(--bg)",
          border: "none",
          borderRadius: "var(--r-lg)",
          padding: "var(--s-2)",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {pending ? "Apostando..." : "Apostar"}
      </button>
    </form>
  );
}
