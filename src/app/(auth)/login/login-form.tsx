"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "../actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { authFormStyles as s } from "../auth-styles";

const initialState: ActionState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} style={s.form}>
      <h1 style={s.title}>Iniciar sesión</h1>
      <label style={s.label}>
        Usuario
        <input name="username" required autoComplete="username" style={s.input} />
      </label>
      <label style={s.label}>
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={s.input}
        />
      </label>
      {state.error && <p style={s.error}>{state.error}</p>}
      <TurnstileWidget />
      <button type="submit" disabled={pending} style={s.button}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <p style={s.hint}>
        ¿No tenés cuenta? <Link href="/registro">Creá una</Link>
      </p>
    </form>
  );
}
