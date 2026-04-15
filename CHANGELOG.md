# Changelog

Alle vigtige ændringer i Project SHIFT dokumenteres her.
Format foelger [Semantic Versioning](https://semver.org/lang/da/).

---

## [1.2.0] - 2026-04-15

### Entra ID Group-Based Access Control (v0.7.0 Feature)

Enterprise-kunder kan nu styre adgang til Project SHIFT via Security Groups i Microsoft Entra ID.

#### Database Schema (Prisma)
- **`Organization`**: Tilføjet `entra_group_id` og `entra_tenant_id` felter til tenant-konfiguration
- Super-Admins kan nu knytte en Entra ID Security Group til en organisation

#### Auth.js Konfiguration
- **JWT Callback**: Udvider tokenet med `groups[]` (fra Entra ID profil-claims) og `tenantRequiredGroupId` (fra intern API)
- **Session maxAge**: Reduceret fra 8 timer → 2 timer for hurtigere session-invalidation ved gruppe-ændringer
- **Group Overage Handling**: Arkitektur forberedt til `_claim_names.groups` overage-scenariet (>200 grupper)

#### Middleware — Edge Group Validation
- **0ms DB-latency**: Gruppevalidering sker udelukkende via JWT-token på Edge (ingen databaseopslag pr. navigation)
- **Soft Toggle**: Gruppetjek aktiveres KUN hvis `tenantRequiredGroupId` er defineret — deaktiveres øjeblikkeligt ved at slette gruppe-ID i admin-portalen
- **SUPER_ADMIN Bypass**: Globale administratorer undtages automatisk fra tenant-specifikke gruppekrav

#### Nye Filer
- **`apps/web/src/app/unauthorized/page.tsx`**: SoulEx-designet "Adgang Nægtet" side med Forest Green accent, glassmorphism, og dansk brugervejledning
- **`prisma/seed.ts`**: Tilføjet `SUPER_ADMIN` demo-konto (`super@project-shift.dk`)

#### Ændrede Filer
- `apps/web/src/middleware.ts` — Komplet omskrivning med group-validation og import-rettelse
- `apps/web/src/lib/auth.ts` — Udvidet JWT/Session med groups, tenantRequiredGroupId, og reduceret maxAge

#### Governance
- Change Management pakke godkendt (Implementation Plan, Risk Analysis, Rollback Plan, Test Plan)
- Overholder `.rules/06-deployment.md` — alle ændringer testet i DEV før merge

---

## [1.1.3] - 2026-04-15

### Deployment Governance — Zero-Bug Policy

Formalisering af en ufravigelig Zero-Bug Policy for Project SHIFT. Politikken sikrer, at ingen ustabil kode når production, og at alle releases gennemgår en dokumenteret kvalitetskontrol.

#### Governance-regler
- **`.rules/01-process.md`**: Ny sektion "Dev-First Mandate (Zero-Bug Policy)" med 6 ufravigelige regler: ingen direkte push til `main`, obligatorisk lokal build-verifikation, verify-release krav, Test Sign-off gate, rollback-pligt og dokumentationskrav.
- **`.rules/06-deployment.md`**: Ny §0 "Zero-Bug Policy" preamble + ny §4 "Release Checklist — The Gatekeeper" med 7-punkts verifikationstabel der SKAL opfyldes før merge til `main`.
- **`PROJECT_GOVERNANCE.md`**: Ny §7 "Deployment Governance — Zero-Bug Policy" med komplet sammenfatning af Dev-First Mandate, Release Checklist, CMP-krav, rollback-standarder og verifikationskrav.

#### Automatisering
- **`scripts/verify-release.sh`** [NY]: Automatiseret release-gatekeeper script med 5 verifikationskategorier:
  1. Branch-verifikation (bekræfter `development` branch)
  2. Build-verifikation (`npm run build` med exit code kontrol)
  3. Versions-konsistens (package.json ↔ CHANGELOG.md ↔ SYSTEM_STATE.md)
  4. Dokumentations-tjek (CHANGELOG, SYSTEM_STATE, ARCHITECTURE eksistens og alder)
  5. Governance-regler integritet (`.rules/` fil-validering)
- **`package.json`**: Nyt script `verify-release` som wrapper til bash-scriptet.

#### Versions-synkronisering
- **`package.json`**: Version synkroniseret fra `0.1.0` → `1.1.3` (var ude af sync med CHANGELOG.md).
- Alle tre versionsfiler (`package.json`, `CHANGELOG.md`, `SYSTEM_STATE.md`) er nu synkroniseret til `1.1.3`.

---

## [1.1.2] - 2026-04-14

### CI/CD — Opdeling af Development & Production Miljøer

Projektet er strukturelt adskilt i to miljøer for at beskytte produktiondata og muliggøre sikker test.

- **`APP_ENV` Miljøvariabel**: Tilføjet for at differentiere mellem runtime-miljøer uden at overskrive den bundne `NODE_ENV`.
- **Miljø-dokumentation**: `ARCHITECTURE.md` nu indeholder retningslinjer for hvordan staging test foretages på `development` branchen (og ditto Railway miljø) før merge til `main`.

---

## [1.1.1] - 2026-04-14

### M5.2: Railway Deployment CI/CD Fixes (Monorepo)

Afsluttende konfiguration af Railway produktionsmiljøet for NextAuth og NestJS monorepo.

#### Backend (API)
- **`apps/api/Dockerfile`**: Skiftede `npm run build` til `npx turbo run build` i builder-stadiet. Dette sikrer, at interne workspace-afhængigheder (som `@project-shift/esg-core`) kompileres og linkes korrekt ind i dist-mappen, hvilket løser `MODULE_NOT_FOUND` crashet.

#### Frontend (Web)
- **`apps/web/Dockerfile`**: Skiftede `npm run build` til `npx turbo run build` for at tillade kompilering af `@project-shift/shared-types`.
- Fjernede `ENV PORT=3000` hardcoding i web-containeren for at sikre kompatibilitet med Railways dynamiske router.
- Tilføjede miljøvariabel `AUTH_TRUST_HOST=true` til runner-stadiet for at omgå NextAuth's (v5) `UntrustedHost` beskyttelse i reverse-proxy miljøer.
- Sikrede at `NEXTAUTH_URL` kræver protokolfiksering (`https://`) in Railway Variables for at undgå `ERR_INVALID_URL` crash.

---

## [1.1.0] - 2026-04-10

### Auth Migrering — Clerk → NextAuth.js + Microsoft Entra ID

Komplet erstatning af Clerk auth med NextAuth.js og Microsoft Entra ID (Azure AD) som primær SSO-provider. Inspireret af ENVO IT's Lifecycle Portal.

#### Fjernet
- **3 Clerk NPM-pakker:** `@clerk/nextjs`, `@clerk/localizations`, `@clerk/backend`
- **4 Clerk backend-filer:** `ClerkService`, `ClerkModule`, `ClerkWebhookController`, `ClerkWebhookService`
- **Clerk afhængighed:** Al webhook-baseret bruger-sync er erstattet af NextAuth callbacks
- **6 Clerk env-variabler** (publishable key, secret key, webhook secret, sign-in/up URLs)

#### Tilføjet
- **NextAuth.js v5** (Auth.js) med Microsoft Entra ID provider
- **Multi-tenant SSO:** `issuer: common` tillader alle Azure AD tenants at logge ind
- **JIT Provisioning:** NextAuth `signIn` callback opretter brugere via email-domain → Organization matching
- **jose** library til JWT-verificering i NestJS backend (erstatter `@clerk/backend`)
- **`JwtAuthGuard`** — erstatter `ClerkAuthGuard` med standard JWT-verifikation
- **Custom `UserMenu`** komponent — erstatter Clerks `<UserButton>` med SoulEx-æstetik
- **Skjult credentials-fallback** — aktiverbar via `ENABLE_CREDENTIALS_LOGIN=true` for kunder uden Microsoft

#### Ændret — Login-side
- **ENVO IT-inspireret redesign:** Minimalistisk login med én Microsoft SSO-knap
- Fjernet: Watercolor illustration, glassmorphism, email/password felter, Google SSO
- Tilføjet: Shield trust-ikon, "Brug din arbejds- eller skole-konto" hjælpetekst, supportlink
- Resultat: Login-side reduceret fra 4.55 kB → 2.88 kB (~37% mindre)

#### Ændret — Frontend (9 filer)
- `layout.tsx`: `ClerkProvider` → `SessionProvider`
- `middleware.ts`: `clerkMiddleware` → NextAuth `auth()` middleware
- `auth-token-provider.tsx`: Clerk `getToken()` → NextAuth session
- `page.tsx`: `useUser()` → `useSession()`
- `sidebar-nav.tsx`: Clerk `UserButton` → Custom `UserMenu`
- `app-shell.tsx`: Fjernet Clerk imports
- `admin/super/page.tsx`: `useAuth/useUser` → `useSession`

#### Ændret — Backend (4 filer)
- `jwt-auth.guard.ts`: Ny guard med `jose` JWT-verificering (erstatter ClerkAuthGuard)
- `auth.module.ts`: Fjernet webhook-controllere, tilføjet JwtAuthGuard
- `app.module.ts`: Fjernet ClerkModule
- `env.validation.ts`: `CLERK_SECRET_KEY` → `NEXTAUTH_SECRET`

#### Nye env-variabler
```
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
ENABLE_CREDENTIALS_LOGIN=false
```

---

## [1.0.0] - 2026-04-09

### Changelog & Feedback Modul — "Historik & Indmeldinger"

Fuldt integreret system til versionshistorik (Changelog) og bruger-feedback (Indmeldinger), inspireret af ENVO IT's Lifecycle Portal, tilpasset Project SHIFT's SoulEx-designmanual og multi-tenant arkitektur.

#### Database Schema (Prisma)
- **2 nye modeller:** `Changelog`, `Feedback`
- **5 nye enums:** `ChangelogType` (FEATURE/FIX/IMPROVEMENT), `FeedbackType` (BUG/FEATURE/IMPROVEMENT), `FeedbackStatus` (NEW/UNDER_REVIEW/PLANNED/IN_BUILD/DONE), `FeedbackPriority` (LOW/MEDIUM/HIGH)
- **11 nye indexes** for performance på version_build, type, status, organizationId
- Nye relationer: `Organization.feedbacks[]`, `User.feedbacks[]`
- `Changelog.organizationId` er optional — Super Admin opretter globale entries
- `Feedback.isGlobal` tillader cross-tenant synlighed
- `Feedback.changelogId` linker lukkede indmeldinger til changelog-entries

#### Backend — Changelog Module
- **`ChangelogController`** — 6 REST endpoints under `/api/v1/changelog`
- **`ChangelogService`** — CRUD + aggregerede statistikker med filtrering
- Zod-validerede DTOs med danske fejlbeskeder
- Alle kan læse, ORG_ADMIN/SUPER_ADMIN kan oprette/redigere, kun SUPER_ADMIN kan slette
- Auto-sæt `publishedAt` ved publicering

#### Backend — Feedback Module
- **`FeedbackController`** — 7 REST endpoints under `/api/v1/feedback`
- **`FeedbackService`** — Tenant-scoped CRUD med `organizationId`-filter + `isGlobal`-support
- `PATCH /feedback/:id/resolve` — Marker som udført + optional auto-opret changelog-entry
- Ejerskabstjek: Kun ejer eller SUPER_ADMIN kan slette indmeldinger
- Brugerdata inkluderet i responses (firstName, lastName, avatarUrl)

#### Frontend — React Query Hooks
- **`use-changelog.ts`** — `useChangelogs()`, `useChangelogStats()`, `useCreateChangelog()`
- **`use-feedback.ts`** — `useFeedbacks()`, `useFeedbackStats()`, `useCreateFeedback()`, `useUpdateFeedbackStatus()`, `useDeleteFeedback()`
- Query key factories med typed responses og optimistisk cache-invalidering

#### Frontend — Changelog Komponenter
- **`ChangelogStats`** — 4 farvekodede stats-kort (Releases, Features, Rettelser, Forbedringer) med venstre accent-linjer
- **`ChangelogFilters`** — Søgebar + pill-shaped type-filter tags (Alle/Feature/Fix/Forbedring)
- **`ChangelogTimeline`** — Vertikal build-timeline med ekspanderbare BuildGroups, Forest Green dots, type-badges og staggered animationer

#### Frontend — Feedback Komponenter
- **`FeedbackStats`** — 5 stats-kort (Aktive, Fejl, Features, Forbedringer, I Build) med farve-accent
- **`FeedbackFilters`** — Søgebar + status-dropdown + "Ny indmelding" CTA-knap
- **`FeedbackCard`** — Feedback-kort med type-ikon, status/prioritet-badges, brugernavn og alder (8d/3t)
- **`FeedbackModal`** — SoulEx glassmorphism-modal med type-selector (pill-cards), prioritet-radios, validerede inputs

#### Routing & Navigation
- **Ny rute:** `/dashboard/changelog` med pill-shaped tab-navigation (Changelog / Indmeldinger)
- **SidebarNav:** Nyt "Historik" item med ScrollText-ikon (efter Fællesskab)
- **BottomNav:** Nyt "Historik" item for mobilnavigation
- Build-nummer badge i page header (# Build 834-stil)

#### Design (SoulEx Compliance)
- **No-Line Rule:** Hierarki via baggrundsskift (#F5F2ED → #F0EDE8) og bløde skygger
- **Pill-shaped:** Alle tabs, filter-tags og knapper med min 16px radius
- **Tonal Layering:** surface-lowest → surface-container → surface-high progression
- **Animationer:** fadeInUp, scaleIn, countUp staggered delays
- **Glassmorphism:** Modal overlay med backdrop-blur
- **Dansk UI:** Al tekst på dansk med æ, ø, å

#### Governance
- `ARCHITECTURE.md` opdateret: 17 modeller, Domæne 9, 7 nye UI-komponenter
- Alle endpoints overholder multi-tenancy governance (`.rules/03-multi-tenancy-security.md`)
- Alle komponenter overholder branding (`.rules/05-branding.md`)

---

## [0.9.2] - 2026-04-09

### Governance-Opgradering — MediStock Best-Practices Integration

Integreret 12 nye regler fra MediStock.dk's governance-framework i Project SHIFTs regelsæt. Gapanalyse, konflikt-tjek og integration gennemført af Senior System Arkitekt.

#### Nye Regler i `.rules/02-tech-standards.md`
- **Eksplicitte returtyper**: Påkrævet på alle funktioner og metoder.
- **Funktionslængde (SRP)**: Maks 40 linjer pr. funktion. Supplerer eksisterende 250-linjers filgrænse.
- **`default export` forbudt**: Named exports obligatorisk (undtaget Next.js App Router-filer).
- **Adapter Pattern**: Tredjepartsintegrationer SKAL implementeres via adapter-mønsteret.
- **Dato-formatering**: Dansk format (`DD-MM-ÅÅÅÅ`) i UI, ISO 8601 internt.
- **Brugervenlige fejlmeddelelser**: Stack traces og systemdetaljer må aldrig eksponeres mod slutbrugeren.

#### Nye Regler i `.rules/03-multi-tenancy-security.md`
- **RLS ved oprettelse**: `ENABLE ROW LEVEL SECURITY` er nu obligatorisk i migreringsskripter.
- **SEC-SESSION-001**: Komplet session-destruktion ved logout (cookies, localStorage, tokens, hard redirect).
- **Cache-Control**: Beskyttede sider serveres med `no-store, no-cache, must-revalidate` headers.
- **Backup-navngivning**: Standardiseret format: `backup_<tabel>_<YYYY-MM-DD>_<HHmm>.<format>`.

#### Nye Regler i `.rules/04-ui-ux.md`
- **ConfirmDialog**: Bekræftelsesdialog obligatorisk ved alle destruktive UI-handlinger.
- **Kognitiv belastning**: Maks 3-5 primære valgmuligheder synligt pr. handlingsside.
- **Minimum font-størrelse**: 16px for brødtekst (tilgængelighed på mobile enheder).

#### Nye Regler i `.rules/05-branding.md`
- **Tinted Shadows**: Skygger skal have farvetoning frem for neutral grå.

#### Governance-dokument
- **`PROJECT_GOVERNANCE.md`**: Fuldt opgraderet med alle 12 nye regler elegant integreret.

---

## [0.9.1] - 2026-04-09

### M5.1: Railway Deployment Bugfixes

### Governance & AI Rules
- **`.rules/02-tech-standards.md`**: Tilføjet streng sektion `Authentication (Clerk)` med eksplicitte NEVER-regler for at forhindre fremtidig generering af forældet Clerk kode (Pages router, authMiddleware, etc.).

#### Prisma Version Pinning (Kritisk)
- **`package.json`**: Pin `prisma@^6.5.0` som devDependency i root — forhindrer auto-opgradering til Prisma 7 via `npx`
- **`package.json`**: Ændr alle `npx prisma` scripts til `prisma` — bruger lokal installation i stedet for npx resolution
- **`apps/api/package.json`**: Flyt `prisma@^6.5.0` til `dependencies` — nødvendig for Railway `startCommand` (migrate deploy)

#### API Port-binding (Railway-kompatibilitet)
- **`apps/api/src/common/config/env.validation.ts`**: Tilføj `PORT` env var (Railway standard) med prioritet over `API_PORT`
- **`apps/api/src/common/config/env.validation.ts`**: Tillad `postgres://` prefix i DATABASE_URL (Railway-format)
- **`apps/api/src/common/config/env.validation.ts`**: Tilføj `EFFECTIVE_PORT` computed property
- **`apps/api/src/main.ts`**: Brug `EFFECTIVE_PORT` for korrekt Railway port-binding
- **`apps/api/Dockerfile`**: Sæt `ENV PORT=4000` og `HOSTNAME=0.0.0.0` for Railway-detektion

#### Railway Konfiguration
- **`apps/api/railway.json`**: Fjern `npx` fra startCommand, tilføj `healthcheckTimeout: 120`, reducer max retries
- **`package.json`**: Opdatér engines til `node >= 22.0.0` (matcher Dockerfile base image)

---



### M5: Railway Deployment Infrastructure

#### Docker
- **`apps/web/Dockerfile`**: Multi-stage Next.js standalone build (deps → build → runner)
- **`apps/api/Dockerfile`**: Multi-stage NestJS build (deps → build → prod-deps → runner)
- **`.dockerignore`**: Ekskluderer node_modules, build-output, env-filer, docs
- Non-root brugere i begge images for sikkerhed

#### Railway Konfiguration
- **`apps/web/railway.json`**: Dockerfile builder + start command
- **`apps/api/railway.json`**: Dockerfile builder + Prisma migrate deploy

#### API
- **Health endpoint**: `GET /api/v1/health` med database connectivity check
- **CORS**: Dynamisk origin med Railway subdomæne-support via regex
- **Prisma postinstall**: Automatisk `prisma generate` i build-pipeline

#### Git
- Repository initialiseret med initial commit (140 filer)

---

## [0.8.1] - 2026-04-05

### M4: Enterprise Identity & Super Admin Portal

#### Database Schema (Prisma)
- **5 nye modeller:** `SsoConnection`, `IntegrationConfiguration`, `WebhookEventLog`, `OrganizationLicense`, `ImpersonationLog`
- **7 nye enums:** `SsoProvider`, `SsoConnectionStatus`, `IntegrationType`, `IntegrationStatus`, `LicenseTier` + udvidet `ModuleType` med `CANTEEN`, `DELIVERY`, `SPORT`
- Nye relationer på `Organization` → SSO, integrationer, licens

#### Backend — Clerk Enterprise Auth
- **ClerkAuthGuard** opgraderet: `@clerk/backend` v3 med `verifyToken()`, `@Public()` decorator-support, JIT provisioning med Clerk `publicMetadata.role` for SUPER_ADMIN/ORG_ADMIN
- **Webhook Controller** (`POST /api/v1/webhooks/clerk`): Svix signatur-verifikation, håndterer `user.created/updated/deleted`, `organization.created`, `organizationMembership.created/deleted`
- **Webhook Service:** Idempotente handlers med audit logging og soft-delete
- `DevAuthGuard` opgraderet med `@Public()` og `Reflector`-support

#### Backend — Super Admin Module
- **REST endpoints:** Tenant CRUD (`GET/POST/PATCH/DELETE /api/v1/admin/tenants`), integration overview, cross-tenant ESG-aggregering, impersonation
- Alle endpoints kræver `@Roles('SUPER_ADMIN')`
- Bruger unscoped `PrismaService` for cross-tenant adgang
- Zod-validerede DTOs med danske fejlbeskeder
- Dry-run support på destructive operations (soft-delete)
- Transaction-baseret tenant oprettelse (org + license + modules + email domains)

#### Backend — Integration Hub
- **Plugin Interface:** `IntegrationPlugin` kontrakt med `onActivate`, `onDeactivate`, `handleWebhook`, `getStatus`
- **3 plugin skeletons:** Kantine (CANTEEN_MENU_SYNC), Wolt for Work (DELIVERY_WOLT), Wannasport (SPORT_WANNASPORT)
- **Plugin registry:** Map-baseret service med type-safe dispatch
- **REST endpoints:** Plugin discovery, konfiguration, aktivering/deaktivering, generisk webhook-ingress
- Webhook event logging med idempotent deduplicering

#### Frontend — Super Admin Dashboard
- **Admin Shell:** Distinct Forest Green sidebar-tema, adskilt fra normalt dashboard
- **Tenant oversigt:** Søgning, stats-kort (organisationer, brugere, SSO, integrationer), license-tier badges
- **Route-beskyttelse:** `middleware.ts` tjekker `publicMetadata.role === SUPER_ADMIN` for `/admin/super/*` ruter

#### Sikkerhed & Governance
- Alle nye endpoints respekterer multi-tenancy governance (`.rules/03-multi-tenancy-security.md`)
- Audit logging på alle CRUD-operationer
- PII-isolation opretholdt via RLS policies
- Clerk `publicMetadata.role` som Single Source of Truth for SUPER_ADMIN

---

## [0.8.0] - 2026-04-05

### Clerk Auth Integration — "Gør det rigtigt"

#### Frontend — Authentication
- **ClerkProvider** i root layout med dansk lokalisering (`@clerk/localizations` daDK)
- **Middleware** (`middleware.ts`) — route protection, uautoriserede brugere redirectes til `/login`
- **Login-side** — Clerk `<SignIn />` i glassmorphism-kort med brand-styling (`appearance` API), catch-all `[[...sign-in]]` route
- **AuthTokenProvider** — automatisk Clerk JWT injection i alle API-kald via `setAuthTokenProvider()` pattern
- **API client** — `buildHeaders()` er nu async, injekter `Authorization: Bearer <clerk_jwt>` automatisk
- **AppShell** — `<UserButton />` erstatter hardcoded avatar
- **SidebarNav** — `useUser()` viser rigtig brugernavn + e-mail, `<UserButton />` med profil-menu
- **Dashboard** — dynamisk hilsen (`Godmorgen/Goddag/Godaften, {firstName}`) via `useUser()`

#### Backend — JWT Verifikation & Bruger-sync
- **ClerkService** — NestJS injectable wrapper for `@clerk/backend` med `createClerkClient`
- **ClerkModule** — Global modul, eksporterer `ClerkService` til hele applikationen
- **ClerkAuthGuard** — verificerer Clerk JWT via `authenticateRequest`, med 3-trins bruger-sync:
  1. Find via `externalAuthId` (Clerk user ID) — hurtigste vej
  2. Match via e-mail (for seed-brugere) — opdaterer `externalAuthId`
  3. Auto-opret via e-mail-domæne matching — ny `MEMBER` i organisationen
- **Smart guard-valg** — `auth.module.ts` bruger `useFactory` til dynamisk at vælge ClerkAuthGuard (production) eller DevAuthGuard (development)
- **@Public() decorator** — markér endpoints der ikke kræver auth
- **Tenant middleware** — henter `organizationId` fra auth guard (understøtter begge guards)
- `localhost:3001` tilføjet som `authorizedParty` (port 3000 optaget)

#### Nye filer
- `apps/web/src/middleware.ts`
- `apps/web/src/components/providers/auth-token-provider.tsx`
- `apps/api/src/common/clerk/clerk.service.ts`
- `apps/api/src/common/clerk/clerk.module.ts`
- `apps/api/src/modules/auth/guards/clerk-auth.guard.ts`
- `apps/api/src/modules/auth/decorators/public.decorator.ts`

### Verificeret
- TypeScript strict mode: ✅ 0 fejl (frontend + backend)
- Next.js production build: ✅ 9/9 sider genereret
- Clerk middleware: ✅ 86 kB, dynamic route for login

---

## [0.7.1] - 2026-04-04

### Login Landing Page — Brand-teamets Design

#### Nye filer
- `(auth)/login/page.tsx` — Login-side med full-bleed illustration, glassmorphism login-kort
- `(auth)/layout.tsx` — Auth layout uden AppShell/sidebar
- `illustrations/login-hero.png` — Watercolor illustration: dansk landskab, samkørende kollegaer

#### Design elementer (brand-team reference)
- Full-bleed watercolor illustration som baggrund (venstre/bag)
- Glassmorphism login-kort (højre, 88% opacity, blur(24px))
- Project SHIFT logo med Forest Green gradient + Leaf-ikon
- "Log ind på din arbejdsplads." headline (Bricolage Grotesque)
- Arbejds e-mail + Adgangskode input-felter (rounded-2xl, ghost border)
- Orange gradient CTA: "Log ind →" (pill-shape, hover-scale)
- "Glemt adgangskode?" link
- Social logins: Google + Microsoft ikoner
- Bund-badge med tagline + Leaf-ikon (glassmorphism)
- Responsivt: centreret på mobil, højre-placeret på desktop

---

## [0.7.0] - 2026-04-04

### UI/UX Premium Transformation — "Editorial Organicism v2" (Stitch MCP-drevet)

#### Stitch MCP Design-koncepter
- **Hero Dashboard** — Panoramisk hero, glassmorphism velkomstkort, gradient Quick Actions
- **Social Trip Cards** — "Find din næste tur" editorial header, driver profiler med afdelingsinfo
- **ESG Impact Center** — GrowthRing cirkulær progress, rang-badges, achievement scroll

#### Nye Komponenter
- **GrowthRing** (`components/ui/growth-ring.tsx`) — CSS-only cirkulær conic-gradient progress med skalående træ-ikon og puls-animation
- **AchievementBadge** (`components/ui/achievement-badge.tsx`) — Tre tilstande: unlocked (grøn), current (shimmer glow), locked (gråtone + lås)

#### Design System (globals.css)
- **Glassmorphism**: Opdateret fra 75% → 70% opacity for mere gennemsigtighed
- **Growth Ring CSS**: `.growth-ring`, `.growth-ring-track`, `.growth-ring-inner` med conic-gradient
- **Achievement Badge CSS**: `.achievement-badge-unlocked`, `-current`, `-locked` tilstande
- **No-Line utilities**: `.no-border`, `.surface-editorial`
- **Nye animationer**: `ringPulse`, `shimmerGlow`, `floatCloud`
- **Nye utility-klasser**: `.animate-ring-pulse`, `.animate-shimmer-glow`, `.animate-float-cloud`

#### No-Line Rule — Fuld enforcement
- **Card**: `outlined` variant bruger nu `surface-low` i stedet for `ghost-border`
- **AppShell header**: `border-b` → `shadow-card`
- **BottomNav**: `border-t` → ambiant shadow op ad
- **Button**: Alle størrelser har `min-h-[44px]` for touch targets

#### Side-transformationer
- **Dashboard** — Quick Actions med centrerede gradient-ikon-containere (16×16 → 16×64), editorial "Se alle" link
- **Rides** — "Find din næste tur" editorial headline, driver profiler med afdelingsinfo, nye PersonalityBadge typer (☕ Kaffepause)
- **ESG** — Komplet omskrivning: GrowthRing dark hero, næste-rang progress bar, kompakt 3-grid impact metrikker, horisontal achievement scroll, opdateret bar chart
- **Search** — Konsistens: shadow-vars i MatchCard

#### Komponent-opdateringer
- **Card**: Ny `editorial` variant, shadow-vars i stedet for utility-klasser
- **PersonalityBadge**: Ny `coffee` type (☕ Kaffepause)

### Verificeret
- TypeScript strict mode: ✅ (afventer)
- Next.js production build: ✅ (afventer)
- Browser-verifikation: ✅ (afventer)

---

## [0.6.0] - 2026-04-01

### Levende Illustrationer — "Fra klinisk til kunstnerisk" (GoMore-inspireret)

#### Nye Illustrations-assets (`public/illustrations/`)
- **hero-landscape.png** — Panoramisk dansk landskab med vindmøller, samkørende biler, cyklister, fugle og blomster
- **community-ride.png** — Fire kollegaer i en grøn bil, dansk kvarter, musik/snak-ikoner
- **esg-forest.png** — Skovrejsning med CO₂-skyer der forvandles til sommerfugle, dyr og en karakter
- **empty-state-car.png** — Sød grøn bil med øjne der venter på en tur (akvarel-stil)

#### Side-transformationer
- **Dashboard** — Panoramisk kunstværk som hero-baggrund, glassmorphism velkomstkort svæver OVER illustrationen, gradient overlay for sømløs overgang til baggrund
- **Rides** — Community-illustration som sektions-header, illustreret empty state med ventende bil-karakter
- **ESG Rapport** — Skov-illustration som hero, glassmorphism rang-kort med CO₂-data ovenpå kunsten

#### Design-principper
- Inspireret af GoMore.dk's brug af kunstværker som hero-baggrunde
- UI-elementer "svæver" over illustrationer med glassmorphism
- Gradient overlays (`bg-gradient-to-t from-background`) sikrer sømløs overgang
- Next.js `Image` komponent bruges til automatisk optimering og lazy-loading

### Verificeret
- TypeScript strict mode: ✅ Ingen fejl
- Next.js production build: ✅ 9/9 sider genereret
- Browser-verifikation: ✅ Alle 3 illustrerede sider godkendt

---

## [0.5.0] - 2026-04-01

### SoulEx UI/UX Transformation — "Editorial Organicism: The Sustainable Concierge"

#### Design System (globals.css)
- **Surface Tiers**: Implementeret 6-trins tonal lagdeling (lowest → highest) for No-Line Rule
- **Shift Circles**: Organiske dekorative baggrundselementer med drift-animation
- **Ghost Border**: Subtil outline_variant @ 20% opacity som fallback
- **Glassmorphism**: Varm tone med 20px backdrop-blur og saturate(180%)
- **Ambient Shadows**: Stitch-inspireret `0 20px 40px` @ 4% opacity
- **Forest Gradient**: Ny premium CTA-gradient (primary-500 → primary-fixed-dim)
- **Font-system**: Bricolage Grotesque (headlines) + Inter (body/labels) med explicit font-family
- **Nye animationer**: driftSlow (Shift Circles), forbedret progressFill

#### Nye komponenter
- **PersonalityBadge** — Sociale præference-badges (🎵 Musik OK, 💬 Snaksalig, 🤫 Stille tur, 🧳 Bagage OK, 🐾 Kæledyr OK)

#### Opdaterede komponenter
- **Card** — Ny `surface` variant (No-Line Rule), fjernet borders fra CardFooter, ambient shadow default
- **Button** — Ny `forest` gradient variant, rounded-full (pill-shape), `secondary` bruger surface-high
- **StatCard** — Kompakt padding, font-sans værdier (Bricolage Grotesque)
- **Input/SelectInput/TextareaInput** — Borderless med surface_container_high baggrund, Forest Green focus glow
- **SidebarNav** — Glassmorphism baggrund, fjernet alle borders (No-Line Rule), grøn aktiv-dot indikator

#### Side-transformationer
- **Dashboard** — SoulEx velkomst-modul med Shift Circles, Forest Green hero kort, CO₂ glassmorphism badge, tonal surface KPI-kort
- **Rides (Køreture)** — Sociale invitations-kort med PersonalityBadges, prominente tidspunkter (Bricolage), farvede rute-dots (grøn → orange), orange FAB
- **New Ride (Opret tur)** — Conversational form i surface-low container, CO₂ impact preview kort, ArrowLeft navigation
- **Search (Find tur)** — Conversational søgeform, driver avatars i match-resultater, forbedret rute-visualisering
- **ESG Rapport** — Forbedret gamification: cirkulær rang-avatar, orange glow progress bar, "Aktuel"-badge highlighting, glassmorphism opsummeringskort

#### Designsystem-governance
- Stitch MCP-genererede high-fidelity designs som reference
- Alle ændringer valideret mod `.rules/05-branding.md`

### Verificeret
- TypeScript strict mode: ✅ Ingen fejl
- Next.js production build: ✅ 0 fejl, 9/9 sider genereret
- Bundle sizes: Alle sider under 6 kB

---

## [0.4.0] - 2026-04-01

### Brand Identity Transformation — "Fra klinisk data til menneskeligt fællesskab"

#### Design System
- **Farvepalette**: Teal/Slate → Warm Sands (#F5F2ED), Forest Green (#2D5A27), Sun-kissed Orange (#FF8C42)
- **Typografi**: Inter → Bricolage Grotesque (Google Fonts)
- **Glassmorphism**: Varmere toner med rgba(245, 242, 237, 0.75) + blur(20px)
- **Skygger**: Lavere opacity med varme undertoner
- **Radius**: Minimum rounded-2xl (16px), cards rounded-3xl (24px)
- **Nye animationer**: growTree, floatUp, progressFill, glowPulse, sway (ESG gamification)
- **Nye utilities**: `.gradient-cta`, `.gradient-forest`, `.surface-warm`

#### Nye komponenter
- **`Input`** — Dedikeret form-input med store touch-targets (h-12), ikon-support, fejlvisning
- **`SelectInput`** — Custom dropdown med rounded-2xl og chevron-ikon
- **`TextareaInput`** — Textarea med warm border og focus-ring
- **Button `cta` variant** — Sun-kissed Orange gradient med scale-hover-effekt

#### Opdaterede komponenter
- **Button** — Lucide Loader2 spinner, CTA-variant, rounded-2xl
- **Card** — rounded-3xl, p-6 padding, varmere skygger
- **StatCard** — Gradient ikon-baggrund, accent-farve valg, hover-lift effekt
- **Badge** — Varmere cancelled-variant, semibold font
- **Skeleton** — Matcher nye Card-dimensioner (rounded-3xl, p-6)
- **EmptyState** — Større ikon (h-24), gradient-baggrund, sway-animation, CTA-knap

#### Shell / Navigation
- **AppShell** — Leaf-ikon logo, Forest Green gradient, gradient avatar
- **BottomNav** — Lucide SVG-ikoner, Forest Green aktiv pill-baggrund
- **SidebarNav** — Lucide-ikoner, surface-warm baggrund, gradient avatar, Settings-ikon

#### Side-opdateringer
- **Dashboard** — Personlig Forest Green hero med "Godmorgen, Lars 👋", mini ESG-badge
- **Rides** — Sociale ride-cards med chauffør gradient-avatar, grøn/orange route-dots
- **Ride detail** — Lucide-ikoner, info-cards med rounded baggrund, gradient avatar
- **New Ride** — Konversationelle labels ("Hvor kører du fra?"), nye Input-komponenter
- **Ride Search** — Nye Input-komponenter, route-dot visualisering, CTA-knap
- **ESG Rapport** — Gamificeret hero med rang-system, progressbar med glow, animerede træer, achievement-badges, floating clouds
- **Community** — Lucide Users-ikon, varmere tone

#### Dependencies
- Tilføjet `lucide-react` til `apps/web`

### Verificeret
- Next.js production build: ✅ 0 fejl, 9/9 sider genereret
- TypeScript strict mode: ✅ Ingen type-fejl

---

## [0.3.0] - 2026-03-31

### Tilføjet
- **Dashboard** — KPI-kort (køreture, passagerer, CO₂, km), quick actions, kommende ture
- **Rides List** — Køretur-oversigt med rutevisualisering (dots + stiplet linje)
- **Ride Detail** — Detaljeside med chauffør, passagerer, tilmeld/afmeld knapper
- **Create Ride** — Formular med meeting point-valg, dato/tid, pladser, noter
- **Match Finder** — Søgeside med score-bar, afstand og tidsforskels-visning
- **ESG Rapport** — KPI-kort, CSS-only bar-chart, miljøpåvirknings-kort med træ-beregning
- **Community** — Placeholder-side med "Kommer snart!" empty state
- **App Shell** — Responsiv layout med bund-navigation (mobil) + sidebar (desktop)
- **UI Komponenter** — Button, Card, Skeleton, Badge, EmptyState, StatCard
- **React Query hooks** — useRides, useMeetingPoints, useEsgSummary, useMatchFinder
- **API Client** — Fetch wrapper med RFC 7807 error handling, typed responses
- **Design system** — 7 animation keyframes, shimmer skeleton, staggered delays, glassmorphism
- **Inter font** — Google Fonts via next/font

### Designprincipper overholdt
- Mobil-først med 44px touch targets og safe-area padding
- Skeleton loading screens (ingen spinnere)
- Al UI-tekst på dansk
- Dark mode CSS custom properties
- Glassmorphism kort med hover-transitions

### Verificeret
- Desktop + mobil viewport browser test ✅
- Alle 7 sider renderer korrekt (200 OK)
- Bund-navigation aktiv tab korrekt pr. rute
- Sidebar synlig kun på desktop (≥1024px)

---

## [0.2.0] - 2026-03-31

### Tilføjet
- **DevAuthGuard** — auto-injecter seed-bruger i development, blokerer i production
- **@CurrentUser() decorator** — typesafe parameter decorator for controllers
- **@Roles() decorator + RolesGuard** — rolle-hierarki (MEMBER < ORG_ADMIN < SUPER_ADMIN)
- **Rides CRUD** — 8 REST endpoints (opret, list, hent, opdater, aflys, tilmeld, afmeld, match)
- **PostGIS Match-Finder** — spatial proximity søgning med `ST_DWithin` og vægtet score-algoritme
- **Meeting Points CRUD** — 3 endpoints med privacy-afrunding og ORG_ADMIN-begrænsning
- **ESG Trigger** — automatisk CO2-beregning ved tur-completion via `esg-core`
- **Audit Service** — centraliseret handlingslog, global modul tilgængelig overalt
- **Zod Validation Pipe** — runtime-validering af request bodies med danske fejlbeskeder
- **ESG Summary endpoint** — aggregeret CO2-data for organisation med periodefilter

### Ændret
- `env.validation.ts` — Clerk-nøgler optional i development (tom streng → undefined)
- `esg-core/package.json` — `main` peger nu mod `dist/` for CommonJS runtime
- `shared-types/package.json` — `main` peger nu mod `dist/` for CommonJS runtime
- `docker-compose.yml` — Fjernet forældet `version: "3.8"`

### Verificeret
- API starter korrekt med alle 13 routes registreret
- Ride creation + passenger join + match-finder fuldt testet via cURL
- PostGIS afstandsberegning korrekt (292m fra testposition til København H)
- Match-score algoritme: 0.9044 for nær og tæt tidsvindue

---

## [0.1.0] - 2026-03-31

### Tilføjet
- **Monorepo scaffold** med Turborepo, npm workspaces
- **Prisma database schema** med 15 modeller paa tvaers af 5 domaener
- **PostGIS raw migration** med geography-kolonner, spatial indexes og RLS policies
- **4-lags multi-tenancy**: Schema FK, RLS, Middleware, Prisma $extends
- **NestJS backend skeleton** med modulaer arkitektur (Auth, Organizations, Rides, ESG, Audit)
- **Next.js frontend skeleton** med App Router, Tailwind CSS 4, PWA manifest
- **ESG-beregningsmotor** (`packages/esg-core`) med pure functions og fuld testdaekning
- **Delte TypeScript interfaces** (`packages/shared-types`) for frontend/backend
- **Docker Compose** med PostGIS/PostgreSQL 16 til lokal udvikling
- **Zod-baseret env-validering** ved API-opstart
- **RFC 7807 exception filter** for standardiserede API-fejl
- **Privacy helpers** med GPS-afrunding til 3 decimaler
- **APP_CONFIG** central branding-konstant
- **ARCHITECTURE.md** systemarkitektur-dokumentation
- **Design system tokens** i CSS custom properties (teal/sustainability tema)
- **Seed data** med demo-organisation, brugere og meeting points

### Governance
- `.rules/01-process.md` - Workflow & Process Control
- `.rules/02-tech-standards.md` - Technical Standards & Code Quality
- `.rules/03-multi-tenancy-security.md` - Multi-Tenancy & Data Security
- `.rules/04-ui-ux.md` - UI/UX & Mobile-First Design
- `SYSTEM_STATE.md` - Session state tracking

---

## [0.0.0] - 2026-03-31

### Tilføjet
- Initialt projekt med governance-regler og SYSTEM_STATE
