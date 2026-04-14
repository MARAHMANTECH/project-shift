# ============================================================
# Project SHIFT — Next.js 15 Standalone Docker Build
# Optimeret til Railway deployment
# ============================================================

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app

# Kopiér workspace root + alle package.json filer
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/esg-core/package.json ./packages/esg-core/

# Kopiér Prisma schema (nødvendig for postinstall: prisma generate)
COPY prisma/ ./prisma/

# Installér alle dependencies (workspace-aware, kører postinstall → prisma generate)
RUN npm ci --include=dev

# ── Stage 2: Builder ──
FROM node:22-alpine AS builder
WORKDIR /app

# Kopiér deps fra stage 1 (hoisted til root node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Kopiér al kildekode
COPY package.json package-lock.json tsconfig.base.json turbo.json ./
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

# Build-time env vars (NEXT_PUBLIC_ vars skal være tilgængelige under build)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# NextAuth runtime vars (sættes via Railway env, men skal eksistere under build for middleware)
ARG AUTH_SECRET
ARG AZURE_AD_CLIENT_ID
ARG AZURE_AD_CLIENT_SECRET
ARG NEXTAUTH_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV AZURE_AD_CLIENT_ID=$AZURE_AD_CLIENT_ID
ENV AZURE_AD_CLIENT_SECRET=$AZURE_AD_CLIENT_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js i standalone mode via Turbo for at sikre interne packages bygger (shared-types)
RUN npx turbo run build --filter=@project-shift/web

# ── Stage 3: Runner (minimal) ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_TRUST_HOST=true

# Opret non-root bruger for sikkerhed
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Kopiér standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Sæt korrekt ejerskab
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone server
CMD ["node", "apps/web/server.js"]
