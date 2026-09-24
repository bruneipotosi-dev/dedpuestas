# ADR-0001 · Next.js como monolito (UI + API)

- **Estado:** aceptado · 24/09/2026

## Contexto
Una persona, tres semanas y media de vida útil del producto (21/09 → 17/10), primera versión en 2 días. Hace falta UI móvil, una API para apostar y un panel de administración. Las fichas de streamer necesitan SEO y previsualización en X/Discord (imágenes OG).

## Decisión
Un único servicio **Next.js (App Router) + TypeScript**: páginas, API (Route Handlers / Server Actions) y generación de imágenes OG en el mismo contenedor.

## Alternativas descartadas
- **Frontend SPA + API separada (p. ej. React + Express/Fastify):** dos servicios, dos despliegues, CORS. Más piezas para el mismo resultado.
- **Laravel / Django:** válidos, pero peor encaje para las imágenes OG dinámicas y el renderizado por servidor en React.

## Consecuencias
- ✅ Un contenedor, un pipeline, un despliegue.
- ✅ Render en servidor → buen SEO y previsualizaciones en redes.
- ⚠️ Si algún día hace falta escalar la API aparte, habrá que separarla. Con el volumen previsto no ocurrirá.
