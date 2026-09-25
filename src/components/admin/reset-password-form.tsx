"use client";

import { useActionState } from "react";
import { resetUserPasswordAction, type ResetPasswordState } from "@/app/admin/actions";

const initialState: ResetPasswordState = { error: null };

export function ResetPasswordForm({ userId, username }: { userId: string; username: string }) {
  const [state, formAction, pending] = useActionState(resetUserPasswordAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--s-1)" }}>
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          disabled={pending}
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
          Restablecer contraseña
        </button>
      </form>
      {state.tempPassword && (
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--dedines)", margin: 0, textAlign: "right" }}>
          Nueva contraseña de {username}: <code className="num">{state.tempPassword}</code>
          <br />
          Pasásela ahora — no se vuelve a mostrar.
        </p>
      )}
      {state.error && <p style={{ color: "var(--error-text)", fontSize: "var(--fs-xs)", margin: 0 }}>{state.error}</p>}
    </div>
  );
}
