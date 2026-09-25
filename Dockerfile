# syntax=docker/dockerfile:1.7

# ---------- Etapa deps ----------
# OK: separar la instalación de dependencias en su propia etapa (cachea bien).
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ---------- Etapa builder ----------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
# .dockerignore (raíz del repo) excluye node_modules, .git, .env* y demás:
# sin eso, este COPY pisaba el node_modules recién instalado arriba con
# "npm ci" (con binarios nativos de Linux/Alpine) con el del host, y colaba
# tu .env real adentro de la imagen.
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# "prisma generate" solo necesita que DATABASE_URL exista (no se conecta a la
# base), así que un valor dummy alcanza para el build.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate && npm run build

# ---------- Etapa runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# output: "standalone" en next.config.ts genera .next/standalone (solo lo
# necesario para correr, sin next_modules completo).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Este contenedor solo sirve tráfico; no corre migraciones ni el seed (eso es
# un paso aparte antes del deploy), así que no necesita prisma/schema.prisma,
# seed.ts ni las migraciones. El cliente ya generado viaja dentro de
# .next/standalone (tracing de Next incluye lo que node_modules/@prisma y
# src/generated/prisma necesitan en runtime).

# OK: correr como usuario no root.
USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]