"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "../actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { authFormStyles as s } from "../auth-styles";

const initialState: ActionState = { error: null };

export function RegistroForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} style={s.form}>
      <h1 style={s.title}>Crear cuenta</h1>
      <label style={s.label}>
        Usuario
        <input
          name="username"
          minLength={3}
          maxLength={20}
          required
          autoComplete="username"
          style={s.input}
        />
      </label>
      <label style={s.label}>
        Contraseña
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
      <TurnstileWidget />
      <button type="submit" disabled={pending} style={s.button}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
      <p style={s.hint}>
        Al registrarte recibís 1.000 Dedines para empezar a apostar.
      </p>
      <p style={s.hint}>
        ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link>
      </p>
    </form>
  );
}
