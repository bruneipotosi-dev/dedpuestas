# TODO — piezas que escribís vos

Según "Modo aprendizaje" en `CLAUDE.md`, estas dos las escribís vos; acá van pistas, no el código.

## 1. `Dockerfile`

Objetivo: imagen de producción multi-arch (amd64 + arm64) para `app` (Next.js standalone), que reemplace el servicio `app` de `compose.yaml` (hoy usa `node:22-alpine` genérico + volumen, sin build propio).

Pistas:
- Activá `output: "standalone"` en `next.config.ts` — genera `.next/standalone` con solo lo necesario para correr, sin `node_modules` completo.
- Build **multi-stage**: una etapa `deps` (instala dependencias), una `builder` (`npm run build`), una `runner` final copiando solo `.next/standalone`, `.next/static` y `public/`.
- La etapa final corre como usuario **no root** (`USER node` o creá uno) y expone el puerto 3000.
- No necesitás `prisma` ni el código fuente completo en la imagen final: las migraciones corren aparte (paso de CI/CD o `docker compose exec`), no dentro del contenedor de la app en cada arranque.
- Referencia oficial: https://nextjs.org/docs/app/getting-started/deploying#docker (sección Dockerfile del propio Next.js).
- Cuando lo tengas, en `compose.yaml` cambiá el servicio `app` de `image: node:22-alpine` + `command` a `build: .` (o `build: { context: ., dockerfile: Dockerfile }`).

## 2. Workflow de CI (`.github/workflows/ci.yml`)

Objetivo: en cada push/PR — lint, typecheck, tests (con Postgres para los de integración), build; en `main`, además publicar la imagen multi-arch a GHCR.

Pistas:
- Job 1 (`test`): checkout → `actions/setup-node` → `npm ci` → `npm run lint` → `npm run build` (necesario antes de `npm run typecheck` porque genera `.next/types`) → `npm run typecheck` → `npm test`.
  - Para los tests que tocan Postgres (saldo/mercados, RNF-2), usá un `services: postgres:` en el job (imagen `postgres:17-alpine`) o Testcontainers, con las mismas env vars que `compose.yaml`.
- Job 2 (`build-and-push`, solo en `main`, `needs: test`): `docker/setup-qemu-action` + `docker/setup-buildx-action` + `docker/build-push-action` con `platforms: linux/amd64,linux/arm64` → GHCR (`ghcr.io/<usuario>/dedpuestas`). Necesita el `Dockerfile` del punto 1.
- Referencia oficial: https://docs.github.com/actions/publishing-packages/publishing-docker-images
- Recordá activar "Require status checks to pass" con el check `ci` en el ruleset de `main` (paso 3 del KICKOFF) una vez que el workflow exista.

## Notas de esta rama (`chore/scaffold`)

- Se movió `prisma` (CLI) a `devDependencies`; `@prisma/client` queda en `dependencies` porque sí corre en producción.
- `prisma@6.19.3` en vez de `latest` (8.0.0-rc.x): la 8.x es release candidate y trae dependencias con vulnerabilidades de dev. La 6.19.3 tiene una vulnerabilidad "alta" heredada en `deepmerge-ts` (usada por `@prisma/config` al fusionar config), pero es solo de la CLI —no corre en producción ni procesa input de usuarios de la web—, así que el riesgo real es bajo. Si preferís cerrarla del todo, la alternativa sin ella es bajar a `prisma@6.12.0` (`npm audit fix --force`).
- El modelo `Player` en `prisma/schema.prisma` agrega `avatarUrl`, `trackerStreamerSlug` y `eliminatedAt` sobre lo que dice `docs/03-arquitectura.md` (que es "primera versión"), porque el seed y HU-10/HU-31 los necesitan.
