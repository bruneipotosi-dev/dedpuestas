"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import type { ActionState } from "@/app/(auth)/actions";
import { authFormStyles as s } from "@/app/(auth)/auth-styles";

const initialState: ActionState = { error: null };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} style={s.form}>
      <h1 style={s.title}>Cambiá tu contraseña</h1>
      <p style={s.hint}>
        Un administrador te generó una contraseña temporal. Elegí una nueva para seguir.
      </p>
      <label style={s.label}>
        Contraseña nueva
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          style={s.input}
        />
      </label>
      {state.error && <p style={s.error}>{state.error}</p>}
      <button type="submit" disabled={pending} style={s.button}>
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
