"use client";

import { useTransition } from "react";
import { claimBonusAction } from "@/app/(markets)/actions";
import { DedinIcon } from "./dedin-icon";

export function DailyBonusButton() {
  const [pending, startTransition] = useTransition();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--s-3)",
        background: "var(--dedines-soft)",
        border: "1px solid var(--dedines-border)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-2) var(--s-2) var(--s-2) var(--s-3)",
      }}
    >
      <DedinIcon size={22} />
      <div style={{ flex: 1, lineHeight: 1.25 }}>
        <strong style={{ display: "block", fontSize: "var(--fs-md)" }}>Bono diario listo</strong>
        <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>+100 Dedines · vuelve mañana por más</span>
      </div>
      <button
        disabled={pending}
        onClick={() => startTransition(() => claimBonusAction())}
        style={{
          background: "var(--dedines)",
          color: "var(--bg)",
          border: "none",
          borderRadius: "var(--r-md)",
          padding: "var(--s-2) var(--s-3)",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {pending ? "..." : "Reclamar"}
      </button>
    </div>
  );
}
