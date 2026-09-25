"use client";

import { useTransition } from "react";
import { claimWeeklyRescueAction } from "@/app/(markets)/actions";

export function WeeklyRescueButton() {
  const [pending, startTransition] = useTransition();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--s-3)",
        background: "var(--gulag-soft)",
        border: "1px solid var(--gulag-border)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-2) var(--s-2) var(--s-2) var(--s-3)",
      }}
    >
      <div style={{ flex: 1, lineHeight: 1.25 }}>
        <strong style={{ display: "block", fontSize: "var(--fs-md)", color: "var(--gulag-text)" }}>
          Te quedaste sin Dedines
        </strong>
        <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>Rescate semanal · +200 Dedines</span>
      </div>
      <button
        disabled={pending}
        onClick={() => startTransition(() => claimWeeklyRescueAction())}
        style={{
          background: "var(--gulag)",
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
