"use client";

import { useTransition } from "react";
import { claimBonusAction } from "@/app/(markets)/actions";

export function DailyBonusButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => claimBonusAction())}
      style={{
        background: "var(--dedines)",
        color: "var(--bg)",
        border: "none",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-2) var(--s-4)",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {pending ? "Reclamando..." : "Reclamar bono diario (+100 Dedines)"}
    </button>
  );
}
