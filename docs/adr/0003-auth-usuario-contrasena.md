# ADR-0003 · Auth propia con usuario y contraseña, preparada para OAuth

- **Estado:** aceptado · 24/09/2026 · Sustituye la propuesta inicial de login con Discord

## Contexto
Se descartó Discord. Se quiere entrar en segundos y **sin email**. Más adelante interesa "Entrar con Kick" (la serie se emite solo en Kick, que tiene OAuth 2.1 oficial) o Google.

## Decisión
- Registro con **usuario + contraseña**; hash **argon2id**.
- **Sesiones propias** en base de datos: cookie `HttpOnly`, `Secure`, `SameSite=Lax`, id de sesión aleatorio de 256 bits, expiración deslizante.
- Tablas separadas **`user`** y **`auth_identity`** (`provider`, `provider_user_id`, `password_hash`). Añadir Kick = nueva fila con `provider = 'kick'`, usando la librería **Arctic** para el flujo OAuth.
- **Cloudflare Turnstile** en registro y login; rate limit por IP; bloqueo de 15 min tras 5 intentos fallidos.
- Sin email no hay recuperación automática: el admin genera una contraseña temporal (HU-33).

## Alternativas descartadas
- **Auth.js (NextAuth) con Credentials:** su propia documentación desaconseja el login con contraseña, y esconde lo que queremos aprender.
- **Servicio externo (Clerk, Auth0, Supabase Auth):** rápido, pero dependencia de terceros y datos fuera.

## Consecuencias
- ✅ Control total y buen material de aprendizaje (hashing, sesiones, rate limit).
- ⚠️ Somos responsables de la seguridad del login: tests obligatorios en cada punto de la lista de arriba.
- ⚠️ Cuentas múltiples: mitigadas, no eliminadas. Se vigilan a mano en el ranking.
