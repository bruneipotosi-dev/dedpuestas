# CLAUDE.md — Dedpuestas

Web de fans para apostar **Dedines** (moneda virtual **sin valor**) sobre quién muere en *Dedsafio 4*, una serie hardcore de Minecraft que se emite en Kick (21/09 → 17/10/2026).

## Lee primero
- `docs/01-brief.md` — objetivo, alcance, fechas, riesgos
- `docs/02-requisitos.md` — reglas de negocio (RN-*), historias (HU-*), no funcionales (RNF-*)
- `docs/03-arquitectura.md` — diagrama, modelo de datos, flujos críticos
- `docs/adr/` — decisiones y por qué
- `design/dedpuestas-v0.4.html` — diseño aprobado (ábrelo en un navegador)
- `design/tokens.css` — colores, tipografía, radios y espaciado
- `data/seed-dedsafio4.json` — 91 jugadores y 4 equipos

## Stack
Next.js (App Router) + TypeScript · PostgreSQL 17 + Prisma · sesiones propias + argon2id · Docker Compose · GitHub Actions + GHCR (multi-arch amd64/arm64) · Cloudflare Tunnel + Turnstile · Vitest (+ Testcontainers para Postgres) · Playwright para e2e.

## Reglas del producto que el código nunca rompe
1. Los Dedines **no se compran, venden, transfieren ni canjean**. No escribas nada que lo sugiera ("depositar", "retirar", "cobrar dinero").
2. El saldo es `SUM(ledger_entry.delta)`. **Nunca** `UPDATE` ni `DELETE` sobre `ledger_entry`. Los errores se corrigen con un movimiento compensatorio.
3. Apostar y resolver: **una transacción** con bloqueo de filas. Importes en enteros.
4. Ningún saldo puede quedar negativo; ningún mercado se puede resolver dos veces. Ambas cosas con test.
5. Fechas en UTC en la base de datos; se muestran en la zona del usuario.
6. Aviso "Dedines sin valor real · Sitio de fans no oficial" en el pie de todas las páginas.
7. Nada de logos oficiales de Dedsafio, Eufonia Studios ni Kick.

## Reglas de diseño
- Usa **solo** las variables semánticas de `design/tokens.css` (`--die`, `--live`, `--dedines`, `--gulag`, `--pending`, `--brand`…). Nunca un hex en un componente.
- El rosa (`--brand`) es solo para logo, enlaces y foco. La selección es blanca.
- Móvil primero (360 px). Escritorio a partir de 1024 px: el panel de apuesta pasa a columna fija a la derecha.
- Rojo/verde nunca como única señal: siempre con el texto "Muere" / "Sobrevive".

## Privacidad del repo (es público: portfolio)
- **Nunca** en el código, commits, issues ni docs: nombres reales del autor, ciudad, dominio propio, IPs, hostnames, IDs de cuentas cloud (OCIDs, tenancy, account IDs), tokens.
- Usa placeholders (`example.com`, `<SERVER_HOST>`, `<OCI_TENANCY_OCID>`) y variables de entorno. `.env*` está en `.gitignore`; existe un `.env.example` sin valores reales.

## Forma de trabajar (Git)
- `main` está protegida: **nada entra sin PR** y sin CI en verde.
- Una rama por issue: `feat/hu-11-apostar`, `fix/...`, `chore/...`, `docs/...`.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`), en español, referenciando la HU: `feat(apuestas): valida saldo antes de apostar (HU-11)`.
- Cada PR: qué cambia, cómo probarlo, qué HU/RN cubre, checklist de la Definition of Done.

## Definition of Done
- [ ] Criterios de aceptación de la HU cumplidos
- [ ] Tests (unitarios + integración con Postgres para lógica de saldo/mercados)
- [ ] `lint`, `typecheck` y tests en verde en CI
- [ ] Desplegado en staging y probado en móvil
- [ ] Docs/ADR actualizados si cambió una decisión

## Modo aprendizaje (importante)
El autor es DevOps junior y quiere **aprender**, no solo recibir código.
- **Antes de un cambio grande, explica el plan en 3–5 puntos** y espera el OK.
- Al terminar, resume **qué hiciste y por qué** en lenguaje simple, y señala 1 concepto que merezca estudiarse.
- **No escribas tú estas piezas; guía y revisa:**
  1. el `Dockerfile` de la app,
  2. el primer workflow de GitHub Actions (`ci.yml`),
  3. el primer módulo de Terraform (más adelante),
  4. el primer playbook de Ansible (más adelante).
  Para esas: da pistas, la estructura y la documentación oficial; revisa lo que escriba el autor y señala errores.
- En infraestructura, prefiere soluciones que el autor pueda explicar en una entrevista frente a atajos mágicos.
- Comunicación: el autor escribe en español (a veces italiano), informal y con erratas; responde en español claro y directo.

## Comandos (se completarán al crear el proyecto)
- `docker compose up -d` — entorno local
- `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test`
- `npx prisma migrate dev` · `npm run db:seed`

## Estado de los datos
El seed marca a todos los jugadores como `alive`. **No es la realidad**: ya hubo eliminaciones el día 1 (p. ej. SpreenDMC). El admin actualizará estados desde el panel; no inventes resultados.
