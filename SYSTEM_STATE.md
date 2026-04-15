# SYSTEM_STATE - Project SHIFT

> Denne fil er projektets "Source of Truth".
> Læs den ved starten af HVER session. Opdater den efter HVER afsluttet opgave.

---

## Aktuel Version
`v1.3.0` - Super Admin Modul + JIT User Provisioning

## Aktuel Milestone
**M6: Auth Migration** ✅ Clerk → NextAuth.js + Microsoft Entra ID

## Status
| Omraade | Status |
|---------|--------|
| `.rules/` governance | ✅ Færdig |
| `SYSTEM_STATE.md` | ✅ Færdig |
| `ARCHITECTURE.md` | ✅ Færdig |
| `CHANGELOG.md` | ✅ Færdig |
| Monorepo scaffold (Turborepo) | ✅ Færdig |
| Database schema (Prisma, 15 modeller) | ✅ Færdig |
| PostGIS + RLS migration | ✅ Færdig |
| Seed data | ✅ Færdig |
| NestJS backend skeleton | ✅ Færdig |
| Next.js frontend skeleton | ✅ Færdig |
| ESG beregningsmotor + tests | ✅ Færdig |
| Delte TypeScript interfaces | ✅ Færdig |
| Docker Compose (PostGIS) | ✅ Færdig |
| APP_CONFIG central branding | ✅ Færdig |
| PWA manifest | ✅ Færdig |
| Design system tokens (CSS) | ✅ Færdig |
| Auth (NextAuth.js + Entra ID) | ✅ Færdig |
| NextAuth middleware (route protection) | ✅ Færdig |
| JwtAuthGuard (jose JWT-verifikation) | ✅ Færdig |
| JIT Provisioning (email-domain → org) | ✅ Færdig |
| AuthTokenProvider (instant token) | ✅ Færdig |
| npm install + verify build | ✅ Færdig |
| UI Design System (Brand Identity) | ✅ Færdig |
| Stitch MCP Design-koncepter (3 screens) | ✅ Færdig |
| GrowthRing komponent (ESG gamification) | ✅ Færdig |
| AchievementBadge komponent | ✅ Færdig |
| No-Line Rule (border-fjernelse) | ✅ Færdig |
| Premium glassmorphism (70% opacity) | ✅ Færdig |
| Lucide-react ikoner | ✅ Færdig |
| Bricolage Grotesque font | ✅ Færdig |
| Gamificeret ESG-visualisering | ✅ Færdig |
| Input/SelectInput/TextareaInput | ✅ Færdig |
| Brand Identity (alle sider) | ✅ Færdig |
| Docker (web + api Dockerfile) | ✅ Færdig |
| Railway konfiguration | ✅ Færdig |
| Health endpoint (/api/v1/health) | ✅ Færdig |
| CORS produktion (Railway regex) | ✅ Færdig |
| Prisma v6 pinning (forhindrer v7-opgradering) | ✅ Bugfix |
| Railway $PORT-binding (EFFECTIVE_PORT) | ✅ Bugfix |
| DATABASE_URL fleksibel validering | ✅ Bugfix |
| prisma CLI som prod dep (migrate deploy) | ✅ Bugfix |
| Git repository | ✅ Initialiseret |
| Zero-Bug Policy governance | ✅ Færdig |
| Release Checklist (The Gatekeeper) | ✅ Færdig |
| verify-release.sh automatisering | ✅ Færdig |
| Versions-synkronisering (package.json) | ✅ Bugfix |
| Super Admin modul (Tenants/Integrationer/ESG) | ✅ Færdig |
| Multi-domæne tenant support (chips UI) | ✅ Færdig |
| JIT User Provisioning (auto brugeroprettelse) | ✅ Færdig |
| Edge-kompatibel auth split (auth.config.ts) | ✅ Færdig |
| AdminShell delt layout komponent | ✅ Færdig |
| requireSuperAdmin guard (DB-baseret) | ✅ Færdig |
| /api/auth/me rollecheck endpoint | ✅ Færdig |
| Synlig Log ud-knap i sidebar | ✅ Færdig |
| PostGIS deaktiveret for Railway dev | ✅ Bugfix |
| Middleware TypeScript inferens-fix | ✅ Bugfix |
| Railway dev DATABASE_URL konfiguration | ✅ Bugfix |
| promote-admin.mjs værktøj | ✅ Færdig |

## Færdiggjorte Filer

### M0: Governance (2026-03-31)
- `.rules/01-process.md` - Workflow & Process Control
- `.rules/02-tech-standards.md` - Technical Standards & Code Quality
- `.rules/03-multi-tenancy-security.md` - Multi-Tenancy & Data Security
- `.rules/04-ui-ux.md` - UI/UX & Mobile-First Design

### M1: Fundament (2026-03-31)
- `package.json` - Root monorepo med npm workspaces
- `turbo.json` - Turborepo konfiguration
- `tsconfig.base.json` - Delt TypeScript strict config
- `.env.example` - Miljøvariable-template
- `.gitignore` - Omfattende gitignore
- `ARCHITECTURE.md` - Systemarkitektur
- `CHANGELOG.md` - Semantic versioning changelog
- `docker/docker-compose.yml` - PostgreSQL + PostGIS lokal dev
- `prisma/schema.prisma` - 15 database-modeller, 5 domæner
- `prisma/migrations/00_postgis_and_rls/migration.sql` - PostGIS + RLS
- `prisma/seed.ts` - Demo data (ACME Denmark)
- `packages/shared-types/` - TypeScript interfaces (5 filer)
- `packages/esg-core/src/calculator.ts` - ESG pure functions
- `packages/esg-core/src/constants.ts` - Emissionsfaktorer
- `packages/esg-core/__tests__/calculator.test.ts` - 16 test cases
- `apps/api/src/main.ts` - NestJS bootstrap
- `apps/api/src/app.module.ts` - Root module
- `apps/api/src/common/config/env.validation.ts` - Zod env validering
- `apps/api/src/common/config/esg.config.ts` - Central ESG config
- `apps/api/src/common/prisma/prisma.service.ts` - Base Prisma
- `apps/api/src/common/prisma/tenant-prisma.service.ts` - Tenant $extends
- `apps/api/src/common/prisma/prisma.module.ts` - Global Prisma DI
- `apps/api/src/common/tenant/tenant-context.middleware.ts` - Tenant Layer 3
- `apps/api/src/common/filters/http-exception.filter.ts` - RFC 7807
- `apps/api/src/modules/auth/auth.module.ts` - Auth skeleton
- `apps/api/src/modules/organizations/organizations.module.ts` - Org skeleton
- `apps/api/src/modules/rides/rides.module.ts` - Rides skeleton
- `apps/api/src/modules/esg/esg.module.ts` - ESG skeleton
- `apps/api/src/modules/esg/esg-calculator.ts` - ESG wrapper
- `apps/api/src/modules/audit/audit.module.ts` - Audit skeleton
- `apps/web/src/app/layout.tsx` - Root layout (dansk, PWA)
- `apps/web/src/app/page.tsx` - Landing page
- `apps/web/src/config/app.ts` - APP_CONFIG
- `apps/web/src/styles/globals.css` - Design tokens + Tailwind 4
- `apps/web/src/lib/query-client.ts` - React Query config
- `apps/web/src/lib/privacy.ts` - GPS privacy helpers
- `apps/web/public/manifest.json` - PWA manifest

### Governance: Zero-Bug Policy (2026-04-15)
- `scripts/verify-release.sh` - Automatiseret release gatekeeper
- `.rules/01-process.md` - Dev-First Mandate sektion
- `.rules/06-deployment.md` - Zero-Bug Policy + Release Checklist
- `PROJECT_GOVERNANCE.md` - §7: Deployment Governance

### M7: Super Admin Modul (2026-04-15)
- `apps/web/src/app/(admin)/admin/super/page.tsx` - Super Admin dashboard
- `apps/web/src/app/(admin)/admin/super/tenants/page.tsx` - Tenant oversigt
- `apps/web/src/app/(admin)/admin/super/tenants/new/page.tsx` - Opret tenant (multi-domæne)
- `apps/web/src/app/(admin)/admin/super/integrations/page.tsx` - Integrationer
- `apps/web/src/app/(admin)/admin/super/esg/page.tsx` - ESG overblik
- `apps/web/src/app/(admin)/admin/super/components/admin-shell.tsx` - Delt layout
- `apps/web/src/app/api/admin/tenants/route.ts` - Tenant CRUD API
- `apps/web/src/app/api/admin/integrations/route.ts` - Integrationer API
- `apps/web/src/app/api/admin/esg/route.ts` - ESG aggregering API
- `apps/web/src/app/api/auth/me/route.ts` - Rollecheck endpoint
- `apps/web/src/lib/admin-guard.ts` - requireSuperAdmin guard
- `apps/web/src/lib/auth.config.ts` - Edge-kompatibel auth config
- `apps/web/src/lib/auth.ts` - JIT User Provisioning + DB rolle-sync
- `apps/web/src/lib/db.ts` - Prisma singleton
- `scripts/promote-admin.mjs` - SUPER_ADMIN promovering

## Tech Stack (Bekræftet)

| Lag | Teknologi |
|-----|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5 |
| Backend API | NestJS 11 |
| Styling | Tailwind CSS 4 |
| Auth | NextAuth.js v5 + Microsoft Entra ID (multi-tenant) |
| ORM | Prisma 6 + PostGIS |
| Database | PostgreSQL 16 + PostGIS 3.4 |
| Payments | Stripe Connect (Etape 4, deaktiveret) |
| State | React Query (TanStack Query v5) |
| Monorepo | Turborepo + npm workspaces |
| Testing | Vitest |

1. **M2: Core Engine** (stadig udestående)
   - [ ] Frontend ↔ Backend integration (fjern mock-data)
   - [ ] Rute-matching med PostGIS i frontend
   - [ ] Match-Score algoritme (frontend-visning)

2. **Færdiggjorte Milestones**
   - [x] M3: UI/UX Transformation
   - [x] M3.5: UI/UX Premium (Editorial Organicism v2)
   - [x] M4: Clerk Auth Integration (afløst af M6)
   - [x] M5: Railway Deployment Infrastructure
   - [x] M6: Auth Migration (Clerk → NextAuth.js + Entra ID)

---

> **Sidst opdateret**: 2026-04-15T17:12:00+02:00
> **Opdateret af**: AI Agent (v1.3.0 Super Admin Modul + JIT User Provisioning)
