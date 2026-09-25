"use client";

import { useTransition } from "react";
import { claimWeeklyRescueAction } from "@/app/(markets)/actions";

export function WeeklyRescueButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => claimWeeklyRescueAction())}
      style={{
        background: "var(--gulag)",
        color: "var(--bg)",
        border: "none",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-2) var(--s-4)",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {pending ? "Reclamando..." : "Te quedaste sin Dedines — reclamar rescate semanal (+200)"}
    </button>
  );
}
