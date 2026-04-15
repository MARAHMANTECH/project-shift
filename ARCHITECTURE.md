# ARCHITECTURE - Project SHIFT

> Systemarkitektur-dokumentation for Corporate Mobility & Community Platform.
> Opdateres naar nye moduler, services eller database-entiteter tilføjes.

---

## Systemoverblik

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENTS                                │
│  PWA (Next.js)  │  Mobile Browser  │  Desktop Browser         │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴──────────────────────────────────────┐
│                    API GATEWAY (NestJS)                        │
│  Port: 4000  │  Prefix: /api/v1  │  CORS: localhost:3000      │
│                                                               │
│  ┌──────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────────┐  │
│  │ Auth     │ │ Organizations│ │ Rides   │ │ ESG Engine   │  │
│  │ Module   │ │ Module       │ │ Module  │ │ Module       │  │
│  └──────────┘ └──────────────┘ └─────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────────────────┐ │
│  │ Community│ │ Audit        │ │ Super Admin Module        │ │
│  │ Module   │ │ Module       │ │ (SUPER_ADMIN only)        │ │
│  └──────────┘ └──────────────┘ └───────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐│
│  │ Integration Hub (Plugin Architecture)                     ││
│  │ ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐ ││
│  │ │ Canteen │ │ Delivery │ │ Sport     │ │ Custom       │ ││
│  │ │ Plugin  │ │ Plugin   │ │ Plugin    │ │ Webhook      │ ││
│  │ └─────────┘ └──────────┘ └───────────┘ └──────────────┘ ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Common Layer                                             │ │
│  │ - PrismaService (base)                                   │ │
│  │ - TenantPrismaService ($extends med organization_id)     │ │
│  │ - TenantContextMiddleware (AsyncLocalStorage)            │ │
│  │ - HttpExceptionFilter (RFC 7807)                         │ │
│  │ - EnvValidation (Zod)                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────┴──────────────────────────────────────┐
│              PostgreSQL 16 + PostGIS 3.4                      │
│                                                               │
│  Row-Level Security (RLS) on all tenant tables                │
│  PostGIS geography columns for spatial queries                │
└───────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Model (4 Lag)

| Lag | Komponent | Beskrivelse |
|-----|-----------|-------------|
| 1. Schema | `organization_id` FK | Alle tenant-tabeller har obligatorisk FK |
| 2. RLS | PostgreSQL policies | `USING (organization_id = current_setting('app.current_org_id'))` |
| 3. Application | `TenantContextMiddleware` | Propagerer org_id fra JWT via `AsyncLocalStorage` |
| 4. ORM | `TenantPrismaService` | Prisma `$extends` auto-filtrerer alle queries |

---

## Database Entiteter (17 modeller)

### Domæne 1: Auth & Organization
| Model | Formaal | Tenant-scoped |
|-------|---------|---------------|
| `Organization` | Virksomhed / tenant (med `entra_group_id` + `entra_tenant_id`) | Self (id) |
| `User` | Medarbejder | Ja |
| `EmailDomain` | Verificerede e-mail domæner | Ja |
| `OrgModule` | Feature flags pr. organisation | Ja |

### Domæne 2: Ridesharing
| Model | Formaal | Tenant-scoped |
|-------|---------|---------------|
| `MeetingPoint` | Offentlige opsamlingspunkter | Ja |
| `Ride` | Planlagte koereturer | Ja |
| `RidePassenger` | Passager-bookinger | Via Ride |

### Domæne 3: ESG Engine
| Model | Formaal | Tenant-scoped |
|-------|---------|---------------|
| `EsgTripLog` | Immutable CO2-beregningslog | Ja |

### Domæne 4: Community
| Model | Formaal | Tenant-scoped |
|-------|---------|---------------|
| `Event` | Virksomhedsarrangementer | Ja |
| `EventAttendee` | Tilmeldinger | Via Event |
| `PartnerLink` | Affiliate-links | Ja |
| `PartnerClick` | Klik-tracking | Via PartnerLink |

### Domæne 9: Changelog & Feedback
| Model | Formaal | Tenant-scoped |
|-------|---------|---------------|
| `Changelog` | Versionshistorik og build-noter | Nej (global) |
| `Feedback` | Bruger-indmeldinger og feature requests | Ja |

### System
| Model | Formaal | Tenant-scoped |
|-------|---------|---------------|
| `AuditLog` | Alle handlinger logget | Ja |
| `ImpersonationLog` | SUPER_ADMIN sessioner | Nej |

---

## ESG-Beregningsformel

### Formel v1.0

```
CO2_sparet (kg) = distance_km * emission_factor * (1 - 1 / total_occupants)
```

| Parameter | Beskrivelse | Standard |
|-----------|-------------|---------|
| `distance_km` | Turens afstand (PostGIS-beregnet) | - |
| `emission_factor` | kg CO2/km for gennemsnit | 0.12 kg/km |
| `total_occupants` | Chauffoer + passagerer | Min. 2 |

**Kilde:** Energistyrelsen, 2025 data.

**Implementering:** `packages/esg-core/src/calculator.ts` (pure function, 100% testdaekning).

---

## Geospatial Strategi

- **Database:** PostGIS `geography(Point, 4326)` kolonner paa `meeting_points`
- **Indeks:** GiST spatial index for naerhedssogninger
- **Beregninger:** KUN via PostGIS SQL (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`)
- **ALDRIG:** Afstandsberegninger i JavaScript/TypeScript
- **Koordinater:** WGS 84 (SRID 4326), afrundet til 3 decimaler for privacy

---

## API Konventioner

- **Prefix:** `/api/v1/`
- **Format:** RESTful, JSON
- **Fejl:** RFC 7807 Problem Details
- **Auth:** NextAuth.js JWT i `Authorization: Bearer <token>` eller session cookie (maxAge: 2 timer)
- **Auth Provider:** Microsoft Entra ID (multi-tenant) via NextAuth.js — JWT verificeres med `jose` library
- **Credentials Fallback:** Skjult email/password provider (aktiveres via `ENABLE_CREDENTIALS_LOGIN=true`)
- **Tenant:** Udtrukket fra JWT `organizationId` claim
- **Response budget:** < 300ms

---

## Frontend Design System — SoulEx (Editorial Organicism)

### Designfilosofi
"The Sustainable Concierge" — en præmie-oplevelse der føles som et livsstilsmagasin
fusioneret med en high-touch concierge-service. Designet bevæger sig væk fra klinisk
precision og omfavner organisk varme med intentionel asymmetri.

### Farvepalette
| Token | Hex | Anvendelse |
|-------|-----|-----------|
| `--color-primary-500` | `#2D5A27` | Forest Green — primær brand |
| `--color-accent-500` | `#FF8C42` | Sun-kissed Orange — CTA'er |
| `--color-surface` | `#fcf9f4` | Warm Sands — base baggrund |

### Surface Tiers (tonal lagdeling)
Dybde opnås via baggrundsfarveskift, IKKE borders (No-Line Rule):
- `surface-lowest` (#ffffff) → `surface-low` (#f6f3ee) → `surface-container` (#f0ede8) → `surface-high` (#ebe8e3) → `surface-highest` (#e5e2dd)

### Typografi
- **Headlines:** Bricolage Grotesque (editorial, attention-grabbing)
- **Body/Labels:** Inter (funktionel, læsbar)

### Komponent-arkitektur
| Komponent | Fil | Varianter |
|-----------|-----|-----------|
| Card | `card.tsx` | default, elevated, outlined, glass, surface |
| Button | `button.tsx` | primary, forest, secondary, cta, ghost |
| StatCard | `stat-card.tsx` | green, orange, neutral (accent) |
| Input | `input.tsx` | Input, SelectInput, TextareaInput |
| PersonalityBadge | `personality-badge.tsx` | music, talkative, quiet, luggage, pet-friendly |
| Badge | `badge.tsx` | success, warning, error, neutral |
| ChangelogStats | `changelog-stats.tsx` | — |
| ChangelogFilters | `changelog-filters.tsx` | — |
| ChangelogTimeline | `changelog-timeline.tsx` | — |
| FeedbackStats | `feedback-stats.tsx` | — |
| FeedbackCard | `feedback-card.tsx` | — |
| FeedbackModal | `feedback-modal.tsx` | — |
| FeedbackFilters | `feedback-filters.tsx` | — |

### Governance
Alle UI-ændringer SKAL overholde `.rules/05-branding.md`.

---

## Miljøer & CI/CD Pipeline (Railway)

For at sikre kvalitet i leverancen har projektet adskilte miljøer:

*   **Production Environment (`main` branch):** 
    *   Det primære produktionsmiljø.
    *   Deployes automatisk på Railway "Production" ved merge til `main`.
    *   Har live / isoleret produktions-database (`DATABASE_URL`).
    *   Kører med `APP_ENV="production"`.
*   **Development Environment (`development` branch):**
    *   Vores sikre testmiljø. 
    *   Alle features testes her indledningsvist.
    *   Deployes automatisk på Railway "Development".
    *   Har en fuldt isoleret test-database, hvilket sikrer destruktiv data-manipulation ikke påvirker brugere.
    *   Kører med `APP_ENV="development"`.
*   **Lokalt (`localhost`):**
    *   Udviklerens lokale checkout.
    *   Kører med `NODE_ENV="development"` og `APP_ENV="development"`.

---

## Mappestruktur

```
Project_SHIFT/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared-types/ # TypeScript interfaces
│   └── esg-core/     # ESG pure functions + tests
├── prisma/           # Schema + migrations (17 modeller)
├── docker/           # Local dev + production
└── .rules/           # Governance
```

---

> **Sidst opdateret:** 2026-04-15T12:34:00+02:00
> **Version:** v1.2.0 (Entra ID Group-Based Access Control + Zero-Bug Policy)
