# Arranque con Claude Code

Pasos en tu portátil. **Tú haces los pasos 1–4; Claude Code, a partir del 5.**

## 1 · Crear el repo en GitHub
- Nombre: `dedpuestas` · **público** · sin README (ya lo traemos).

## 2 · Subir este paquete
```bash
cd ~/proyectos            # o donde guardes tus repos
unzip dedpuestas-starter.zip && cd dedpuestas
git init -b main
git add . && git commit -m "docs: brief, requisitos, arquitectura, ADR y diseño v0.4"
git remote add origin git@github.com:<TU_USUARIO>/dedpuestas.git
git push -u origin main
```

## 3 · Proteger `main`
GitHub → Settings → Rules → Rulesets → New branch ruleset:
- Target: `main`
- ✅ Restrict deletions · ✅ Block force pushes
- ✅ Require a pull request before merging (0 aprobaciones: trabajas solo, pero el PR queda)
- ✅ Require status checks to pass → añadirás `ci` cuando exista el workflow

## 4 · Crear el tablero
GitHub → Projects → New project → Board. Columnas: *Backlog · Esta semana · En curso · En revisión · Hecho*.
Milestones: **MVP (26/09)**, **v1 (02/10)**, **Final (17/10)**.

## 5 · Abrir Claude Code en la carpeta y pegar esto

```
Lee CLAUDE.md y todo lo que enlaza (docs/, design/, data/).

Tarea 1 — backlog: crea los issues de GitHub con `gh` a partir de
docs/02-requisitos.md: uno por HU, con sus criterios de aceptación como
checklist, etiqueta de prioridad (must/should/could) y el milestone que le toca
(MVP, v1, Final). Añádelos al Project "dedpuestas". Muéstrame la lista antes de crearlos.

Tarea 2 — esqueleto (rama chore/scaffold, PR al terminar):
- Next.js + TypeScript + ESLint, estructura de carpetas, tokens.css importado
  como estilos globales, página de inicio vacía con el pie legal.
- Prisma con el modelo de docs/03-arquitectura.md, primera migración y script
  de seed que cargue data/seed-dedsafio4.json.
- compose.yaml con app + postgres para local, .env.example, .gitignore,
  endpoint /api/health.
- NO escribas el Dockerfile ni el workflow de CI: esos los escribo yo
  (ver "Modo aprendizaje" en CLAUDE.md). Déjame un TODO y pistas.

Antes de empezar, explícame el plan en pocos puntos.
```

## Orden de trabajo hasta el sábado (MVP)
1. Scaffold + modelo de datos + seed
2. **Tú:** Dockerfile + CI (Claude revisa)
3. HU-01 registro/login · HU-40 legal
4. HU-02 bono · HU-10 mercados · HU-11 apostar (con tests de concurrencia)
5. HU-30/31/33 administración · resolución de mercados
6. HU-12 mis apuestas · HU-20 ranking
7. Deploy a staging (servidor casero) → prueba en móvil → producción
