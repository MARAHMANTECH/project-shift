# 02 - Technical Standards & Code Quality

> Disse regler sikrer ensartet kodekvalitet paa tvaers af hele Project SHIFT-kodebasen.
> Overtraedelse vil medfoere afvisning i code review.

---

## TypeScript

- **MUST**: Brug strict mode (`"strict": true` i `tsconfig.json`).
- **NEVER**: Brug ALDRIG typen `any`. Brug `unknown` med type guards hvis typen er ukendt.
- **MUST**: Definer alle API-kontrakter som TypeScript `interface` (ikke `type`) i `src/types/`.
- **MUST**: Brug Zod til runtime-validering af alle eksterne inputs (API requests, form data, webhooks).
- **MUST**: Eksporter Zod-schemas og infer TypeScript-typer med `z.infer<typeof schema>`.
- **MUST**: Eksplicitte returtyper er påkrævet på alle funktioner og metoder. TypeScript's type inference må ikke erstatte deklarativ typespecifikation på funktionssignaturer.

## Geospatiale Beregninger

- **MUST**: ALLE geografiske beregninger (afstande, naerhedssogning, rute-matching) SKAL ske via PostGIS SQL-funktioner (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`).
- **NEVER**: Udforer ALDRIG afstandsberegninger i application-laget (JavaScript/TypeScript). Resultaterne vil vaere upraecise paa grund af jordens kruemning.
- **MUST**: Brug `geography`-kolonnetypen (ikke `geometry`) for korrekt sfaerisk beregning.
- **MUST**: Alle raadatakoordinater SKAL vaere i WGS 84 (SRID 4326).

## Sprog & Encoding

- **MUST**: Brugerfladen (UI) SKAL vaere paa dansk. Danske tegn (ae, oe, aa) SKAL bruges direkte i JSX/TSX.
- **MUST**: Alle filer SKAL gemmes som UTF-8.
- **MUST**: Kode-identifiers (variabler, funktioner, klasser, interfaces) SKAL vaere paa engelsk.
- **MUST**: Kode-kommentarer SKAL vaere paa engelsk for international laesbarhed.
- **NEVER**: Brug ALDRIG Unicode-specialtegn (pile, em-dash, box drawing) i kode eller logs.

## Filstørrelsesgrænse & Kode-Enkelthed

- **MUST**: Maksimalt 250 linjer pr. fil (eksklusiv imports og typer).
- **MUST**: Naar en fil overstiger 250 linjer, SKAL den splittes i mindre, fokuserede moduler.
- **MUST**: Komponenter SKAL følge Single Responsibility Principle - en komponent, et ansvarsområde.
- **MUST**: Funktioner må maksimalt udgøre **40 linjers kode**. Overskrides dette, opbrydes funktionen i kompositoriske hjælpefunktioner.

## Export-Konventioner

- **NEVER**: `default export` er **forbudt** på tværs af kodebasen. Alle eksporter skal være named exports.
- **EXCEPT**: Next.js App Router-filer (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) er undtaget, da frameworket kræver default export.
- **MUST**: Brug barrel exports (`index.ts`) til at eksponere modul-grænseflader.

## Adapter Pattern for Integrationer

- **MUST**: Tredjepartsintegrationer (betalingsgateways, kort-tjenester, e-mail-providers, analytics) SKAL implementeres via Adapter-mønsteret.
- **MUST**: Definer en `interface` for integrationen og en konkret implementering. Dette muliggør hurtig udskiftning af leverandører.
- **NEVER**: Bind ALDRIG forretningslogik direkte til en tredjepartsklients API.

## Dato- og Tidsformatering

- **MUST**: Alle datoer i brugerfladen vises i dansk format (`DD-MM-ÅÅÅÅ`) via `Intl.DateTimeFormat` med `da-DK` locale.
- **MUST**: Intern lagring sker altid i ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`).
- **MUST**: Tidszoner håndteres eksplicit – `Europe/Copenhagen` er standard for visning.

## API Design

- **MUST**: Brug RESTful konventioner med NestJS controllers og services.
- **MUST**: Alle API-fejl SKAL returneres i RFC 7807 Problem Details format.
- **MUST**: API-response budget er <300ms. Queries der overskrider dette SKAL optimeres.
- **MUST**: Alle database foreign keys SKAL have tilhoerende indeks.
- **MUST**: Brug Prisma `$extends` til auto-injektion af tenant-context.

## Error Handling

- **MUST**: Alle services SKAL bruge `try/catch` med meningsfulde fejlbeskeder.
- **NEVER**: Ignorer ALDRIG fejl stiltiende. Log altid med kontekst (userId, organizationId, action).
- **MUST**: Brug custom exception classes der mapper til korrekte HTTP-statuskoder.
- **MUST**: Fejlmeddelelser i brugerfladen SKAL formuleres på forståeligt dansk uden tekniske termer.
- **NEVER**: Stack traces, interne fejlkoder og systemdetaljer må ALDRIG eksponeres mod slutbrugeren – disse forbliver udelukkende i server-logs.

## Secrets & Environment

- **NEVER**: Hardcode ALDRIG credentials, API-noegler eller andre hemmeligheder i kode.
- **MUST**: Brug environment variables via `.env` med Zod-validering ved opstart.
- **MUST**: Oprethold en `.env.example` med alle paakraevede variabler (uden vaerdier).

## Authentication (NextAuth.js + Microsoft Entra ID)

- **MUST**: Brug NextAuth.js v5 (Auth.js) med Microsoft Entra ID som primær SSO-provider.
- **MUST**: Multi-tenant: `issuer: "common"` — alle Azure AD tenants kan logge ind.
- **MUST**: JWT verificeres med `jose` library i backend (`JwtAuthGuard`).
- **MUST**: JIT Provisioning: Nye brugere oprettes automatisk via email-domain → Organization mapping.
- **MUST**: `AUTH_SECRET` env-variabel er påkrævet (NextAuth v5 standard).
- **NEVER**: Brug ALDRIG Clerk-pakker, Clerk-hooks eller Clerk-middleware. Clerk er fuldstændigt fjernet.
- **NEVER**: Brug ALDRIG `fetch()` til at hente session-token. Brug `useSession().data.accessToken` direkte.

## Dependencies

- **MUST**: Før brug af en ny pakke, verificer at den er installeret. Installér automatisk, hvis den mangler.
- **NEVER**: Antag ALDRIG, at target-maskinen allerede har dependencies.

## Stabilitet & Kvalitetssikring

- **NEVER**: Lav ALDRIG "simple fixes" eller "quick patches" der kun adresserer ét symptom. Enhver fejl SKAL analyseres i kontekst af hele systemet.
- **MUST**: Før ENHVER kodeændring committes, SKAL følgende verifikationskæde gennemføres:
  1. `npx tsc --noEmit` i ALLE workspaces (web + api) — 0 fejl.
  2. `npx next build` for web — fuld produktionsbuild.
  3. `npm run build` for api — fuld NestJS kompilering.
  4. Grep for uønskede mønstre (f.eks. fjernede dependencies) — 0 matches.
- **MUST**: Når en fejl rettes, SKAL root cause dokumenteres i commit-beskeden. "Fix type error" er IKKE acceptabelt — beskriv HVORFOR fejlen opstod.
- **MUST**: Ved refaktorering eller migration SKAL ALLE berørte filer identificeres og opdateres i SAMME commit. Halvfærdige migrationer er forbudt.
- **NEVER**: Push ALDRIG kode til `main` der ikke har bestået den fulde verifikationskæde.
