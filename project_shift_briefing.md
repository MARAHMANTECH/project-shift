# Project SHIFT — Projektbriefing

> Tre versioner af den samme historie — tilpasset modtageren.

---

## 🤖 VERSION 1: Teknisk Briefing (til en AI-agent / ny IDE)

### Hvad er Project SHIFT?
En **B2B SaaS-platform for corporate mobility** — bygget som en lukket, multi-tenant PWA, der kombinerer tre funktionsområder:

1. **Samkørsel (Ridesharing)** — Medarbejdere i samme virksomhed matcher køreture baseret på geospatiale opsamlingspunkter. Matching sker via PostGIS `ST_DWithin`-forespørgsler med en vægtet score-algoritme.
2. **ESG-rapportering** — Automatisk beregning af CO₂-besparelser pr. gennemført tur. Formlen er `CO₂_sparet = distance_km × emission_factor × (1 - 1/total_occupants)`. Immutable log. HR kan eksportere nøgletal.
3. **Community & Events** — Virksomhedsinterne arrangementer (padel, løb, etc.) med tilmelding, venteliste og affiliate-tracking til eksterne partnere.

### Arkitektur
- **Monorepo** (Turborepo + npm workspaces)
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend:** NestJS 11, Prisma 6 ORM
- **Database:** PostgreSQL 16 + PostGIS 3.4 med Row-Level Security
- **Auth:** Clerk (afventer integration) — e-mail-domæne-baseret onboarding
- **State:** TanStack Query v5 (React Query)

### Multi-tenancy — 4 lag
| Lag | Mekanisme |
|-----|-----------|
| 1. Schema | `organization_id` FK på alle tenant-tabeller |
| 2. Database | PostgreSQL RLS-policies |
| 3. Application | `TenantContextMiddleware` (AsyncLocalStorage) |
| 4. ORM | `TenantPrismaService` ($extends auto-filter) |

### Governance-regler (`.rules/`)
- Arkitektur-first: Ingen kode før godkendt plan
- Strict TypeScript, ingen `any`
- Alle geo-beregninger i PostGIS (aldrig JavaScript)
- Dansk UI, engelske kodenavne
- Mobil-først PWA med 44px touch targets
- React Query til alt server-state (aldrig `useEffect` + `fetch`)

### Aktuel status: **v0.6.0**
- ✅ Database (15 modeller), API (13 routes), ESG-motor (100% testdækning)
- ✅ Frontend: 9 sider med fuldt design system
- ⬜ Clerk Auth integration (næste skridt)
- ⬜ Production deployment (Railway)

### Nøglefiler
| Fil | Formål |
|-----|--------|
| `SYSTEM_STATE.md` | Session-tracking, milestones |
| `ARCHITECTURE.md` | Komplet systemarkitektur |
| `.rules/05-branding.md` | Brand identity guide |
| `apps/web/src/config/app.ts` | Central `APP_CONFIG` konstant |
| `packages/esg-core/` | ESG-beregninger (pure functions) |

---

## 💬 VERSION 2: Pitch til en ven

> *"Hvad er det egentlig du laver?"*

Forestil dig at du pendler 45 minutter til arbejde hver dag — alene i bilen. Din kollega bor 3 km derfra og kører den samme vej, på det samme tidspunkt. I ved det bare ikke.

**Project SHIFT** er en app, der løser det. Den er bygget til **virksomheder** — ikke privatpersoner som BlaBlaCar.

Sådan virker det:
1. Din virksomhed tilmelder sig. Alle medarbejdere med en `@firma.dk`-mailadresse kommer ind i et lukket netværk.
2. Du siger: "Jeg kører fra Valby Station kl. 7:45." → Appen finder kollegaer der kører næsten samme rute, næsten samme tid.
3. Hver gang I samkører, beregner systemet automatisk **hvor meget CO₂ I har sparet** — og virksomheden kan bruge det i deres ESG-rapportering (det der klimaregnskab). Det er lovpligtigt for store virksomheder nu.

Men det stopper ikke der. Der er også et **community-modul** — firmaet kan oprette events som padel-aftner og løbeklubber, og appen tracker engagement.

Tænk **GoMore** møder **LinkedIn** møder **en ESG-konsulent** — men som en elegant mobil-app der føles som et livsstilsmagasin, ikke en kedelig enterprise-platform.

**Det fede:**
- 🌍 Reel klimaeffekt — bevist med tal, ikke buzzwords
- 🤝 Skaber fællesskab på arbejdspladsen — du lærer kollegaer at kende
- 📊 Virksomheden får gratis ESG-data de ellers ville betale en konsulent for
- 🔒 Totalt lukket — ingen fremmede i bilen, kun kollegaer

---

## 🎨 VERSION 3: Brand-briefing (til et design-/brand-team)

### Projektets Formål

**Project SHIFT** er en digital platform for **corporate mobilitet** — målrettet danske mellemstore og store virksomheder (100-5000+ medarbejdere). Platformen kombinerer samkørsel, ESG-rapportering og community-events i én samlet oplevelse.

Arbejdstitlen "SHIFT" signalerer den forandring, vi ønsker: et **skift** fra solo-bilen til fællesskabet, fra passiv klimasamvittighed til aktiv handling, og fra kold enterprise-software til en varm, menneskelig oplevelse.

### Målgruppe

| Segment | Beskrivelse |
|---------|-------------|
| **Primær bruger** | Medarbejdere (25-55 år) der pendler til kontor 3-5 dage/uge. Smartphone-native. Værdsætter bekvemmelighed og mening. |
| **Beslutningstager** | HR-chef / CSR-ansvarlig / Facility Manager. Køber platformen for ESG-compliance og medarbejdertilfredshed. |
| **Champion** | Den engagerede medarbejder der vil gøre en forskel og opfordrer kollegaer til at samkøre. |

### Tone of Voice

| Dimension | Vores position |
|-----------|----------------|
| Formel ↔ Uformel | **Uformel, men troværdig.** Vi siger "Godmorgen, Lars 👋" — ikke "Bruger: Lars". |
| Teknisk ↔ Menneskelig | **Menneskelig først.** CO₂ er ikke bare kilogram — det er "3 træer plantet denne måned 🌳". |
| Seriøs ↔ Legende | **Legende med substans.** Gamification er en feature, ikke gimmick. |
| Dansk | **Altid dansk UI.** Ægte æ, ø, å. |

### Designfilosofi: "The Sustainable Concierge"

Oplevelsen skal føles som et **livsstilsmagasin fusioneret med en high-touch concierge-service**. Vi kalder design-systemet internt for **SoulEx** (Soul of Experience) og stilretningen for **"Editorial Organicism"**.

**Kerneprincip:** Vi bevæger os væk fra klinisk, steril enterprise-software. Platformen skal føles **varm, organisk og levende** — som om den er designet af mennesker, for mennesker.

### Farvepalette

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ██████████  Warm Sands     #F5F2ED    Base / baggrund     │
│   ██████████  Soft Off-White #fcf9f4    Surface             │
│                                                             │
│   ██████████  Forest Green   #2D5A27    Primær brand        │
│                               Natur, troværdighed, vækst   │
│                                                             │
│   ██████████  Sun-kissed     #FF8C42    Accent / CTA'er     │
│               Orange          Energi, handling, varme       │
│                                                             │
│   Surface Tiers (tonal lagdeling — "No-Line Rule"):         │
│   #ffffff → #f6f3ee → #f0ede8 → #ebe8e3 → #e5e2dd          │
│   Dybde opnås via farveskift, IKKE via borders.             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **"No-Line Rule":** Vi bruger næsten aldrig synlige borders. Dybde og hierarki opnås udelukkende via tonale skift i baggrundsfarverne (surface tiers) og bløde skygger.

### Typografi

| Rolle | Font | Karakteristik |
|-------|------|---------------|
| **Headlines** | **Bricolage Grotesque** | Editorial, opmærksomhedsgribende, personlighed |
| **Body / Labels** | **Inter** | Neutral, funktionel, høj læsbarhed |

### Visuel Stil — Nøgleelementer

| Element | Beskrivelse |
|---------|-------------|
| **Glassmorphism** | Semi-transparente kort med `backdrop-blur(20px)`, varm tone. Bruges til navigation, overlays og hero-elementer. |
| **Afrundede former** | Minimum `border-radius: 16px` på alle kort og knapper. Pill-formede knapper. Ingen skarpe kanter. |
| **Illustrationer** | Håndtegnede, akvarel-inspirerede panoramaer af dansk landskab, fællesskab og natur. GoMore-inspireret — kunst som hero-baggrund, UI svæver ovenpå. |
| **Ambient shadows** | Bløde, lavkontrast-skygger (`shadow-xl` ved 4% opacity). Skaber naturlig dybde uden visuelt støj. |
| **Mikro-animationer** | Fade-in-up på cards, hover-lift effekter, pulserende glow på progress bars, svajende træ-ikoner. |
| **Gamification** | CO₂-besparelser visualiseret som voksende skove, rang-systemer, achievement-badges. Tal alene er utilstrækkeligt. |
| **Sociale elementer** | Profilbilleder, "PersonalityBadges" (🎵 Musik OK, 💬 Snaksalig, 🤫 Stille tur), community-følelse. |

### Konkurrenter & Inspiration

| Platform | Hvad vi lærer |
|----------|---------------|
| **GoMore** | Editorial illustration-stil, kunstværker som hero-baggrunde, varm community-tone |
| **Too Good To Go** | Gamification af bæredygtighed, visuelt engagerende impact-tracking |
| **Wolt** | Micro-interactions, mobil-first UX, premium feel |
| **Airbnb** | "Belong anywhere"-følelsen — vi skaber "SHIFT together"-følelsen |

### Platformens Nøgleskærme

1. **Dashboard** — Personlig velkomst med panoramisk landskabsillustration, KPI-kort (aktive ture, passagerer, CO₂), hurtige handlinger
2. **Køreture (Rides)** — Feed af tilgængelige samkørsler med sociale profiler, rute-visualisering, PersonalityBadges
3. **Opret Tur** — Konversationel formular ("Hvor kører du fra?"), real-time CO₂-preview
4. **Find Tur** — Søg i nærheden med match-score og driver-info
5. **ESG Rapport** — Gamificeret dashboard med rang, voksende skov, progress bars, achievements
6. **Community** — Events, tilmeldinger, partner-links

### Hvad vi har brug for fra et brand-team

1. **Logodesign** — Arbejdstitlen er "Project SHIFT". Logoet skal fange bevægelse, fællesskab og bæredygtighed. Forest Green som primær farve.
2. **Illustrationer** — Vi har prototype-illustrationer (AI-genererede). Vi har brug for en **konsistent illustrations-stil** i akvarel/editorial-retning: Dansk landskab, samkørende mennesker, natur, vindmøller, community-scener.
3. **Ikonografi** — Vi bruger Lucide-react (tykke, afrundede ikoner). Evt. skræddersyede ikoner der matcher illustrationsstilen.
4. **Brand Guidelines** — Formaliseret dokument med farver, typografi, tone-of-voice, do's & don'ts, brug af illustrationer, spacing/layout-principper.
5. **Social media templates** — Til employer branding og B2B-salg.
6. **Pitch deck-design** — Til investor-/salgspræsentationer.

### Eksisterende Design-assets

- 4 panoramiske illustrationer (`public/illustrations/`)
- Fuldt fungerende designsystem i CSS med tokens, animationer og komponenter
- 9 implementerede sider med den nuværende visuelle stil
- Brand-regler i `.rules/05-branding.md`

---

> *"Fra klinisk data til menneskeligt fællesskab."*
> — Project SHIFT designfilosofi
