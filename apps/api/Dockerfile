# ============================================================
# Project SHIFT — NestJS 11 Docker Build
# Optimeret til Railway deployment
# ============================================================

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app

# Kopiér workspace root + alle package.json filer
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/esg-core/package.json ./packages/esg-core/

# Kopiér Prisma schema (nødvendig for prisma generate i postinstall)
COPY prisma/ ./prisma/

# Installér alle dependencies (workspace-aware, inkl. devDeps for build)
RUN npm ci --include=dev

# ── Stage 2: Builder ──
FROM node:22-alpine AS builder
WORKDIR /app

# Kopiér deps + genereret Prisma client fra stage 1 (hoisted)
COPY --from=deps /app/node_modules ./node_modules

# Kopiér al kildekode
COPY package.json package-lock.json tsconfig.base.json turbo.json ./
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
COPY prisma/ ./prisma/

# Build NestJS
RUN npm run build --workspace=@project-shift/api

# ── Stage 3: Production Dependencies ──
FROM node:22-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/esg-core/package.json ./packages/esg-core/
COPY prisma/ ./prisma/

# Kun production dependencies (prisma CLI inkluderet som prod dep for migrate deploy)
RUN npm ci --omit=dev

# ── Stage 4: Runner (minimal) ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Opret non-root bruger for sikkerhed
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Kopiér prod deps (hoisted)
COPY --from=prod-deps /app/node_modules ./node_modules

# Kopiér build output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Kopiér Prisma schema + migrationer (nødvendig for migrate deploy)
COPY prisma/ ./prisma/

# Kopiér package.json (for workspace resolution)
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Sæt korrekt ejerskab
RUN chown -R nestjs:nestjs /app

USER nestjs

EXPOSE 4000
ENV HOSTNAME="0.0.0.0"

# NestJS production start
CMD ["node", "apps/api/dist/main.js"]
