# TODO — piezas pendientes

## Hecho
- ✅ `Dockerfile` — lo escribiste vos, lo revisamos y terminamos juntos.
- ✅ `.github/workflows/ci.yml` — lint, build, typecheck, tests (Vitest +
  Testcontainers), y en `main` build+push multi-arch a GHCR.

## Pendiente (necesita accesos que no tengo: tu servidor, tu cuenta de Oracle Cloud, tu Tailscale)

### 1. Requerir el check `ci` en el ruleset de `main`
Ya existe el workflow; falta activarlo en la protección de rama (paso 3 del KICKOFF que quedó pendiente):
GitHub → Settings → Rules → Rulesets → `main-protection` → Require status checks to pass → agregar `test` (el job de `ci.yml`).

### 2. Deploy a staging/producción
El workflow de CI construye y publica la imagen a `ghcr.io/<usuario>/dedpuestas`, pero no la despliega — eso necesita:
- Acceso SSH a tu servidor casero vía Tailscale (no tengo tus credenciales ni acceso a tu red).
- Un `compose.yaml` de producción (o un job de deploy) que haga `docker pull` + `docker compose up -d` con la imagen nueva.
- Secrets en GitHub Actions: probablemente un token de Tailscale y la ubicación del servidor.

Pista concreta: un job `deploy-staging` (automático al mergear a `main`, según `docs/03-arquitectura.md`) que se conecte por Tailscale SSH Action (`tailscale/github-action`) y corra el pull+up en el servidor. `deploy-production` igual pero con `environment: production` y aprobación manual en GitHub (Settings → Environments → Required reviewers).

### 3. Terraform (primer módulo)
Según `CLAUDE.md`, esto lo escribís vos con guía. Tiene sentido esperar a que Oracle Cloud apruebe la cuenta (brief: "Aprobación de Oracle lenta") antes de escribirlo, ya que hoy no hay nada que provisionar todavía (todo corre en tu servidor casero).

### 4. Ansible (primer playbook)
Mismo caso: esperá a tener claro qué configurar en el servidor de producción antes de automatizarlo.

## Notas de decisiones tomadas

- `prisma` (CLI) en `devDependencies`; `@prisma/client` en `dependencies` (corre en producción).
- `prisma@6.19.3` en vez de `latest` (8.0.0-rc.x es release candidate). Tiene una vulnerabilidad "alta" heredada en `deepmerge-ts` (de la CLI, no corre en producción); alternativa sin ella: bajar a `prisma@6.12.0`.
- El modelo `Player` agrega `avatarUrl`, `trackerStreamerSlug` y `eliminatedAt` sobre lo que dice `docs/03-arquitectura.md` (HU-10/HU-31 los necesitan).
- Turnstile: sin `TURNSTILE_SECRET_KEY`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY` configuradas, la verificación se omite (modo dev) — no hay dominio en Cloudflare todavía.
- Sin tests e2e con Playwright todavía (la cobertura es de integración con Vitest + Postgres real vía Testcontainers).
