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

## Filstoerrelsesgraense

- **MUST**: Maksimalt 250 linjer pr. fil (eksklusiv imports og typer).
- **MUST**: Naar en fil overstiger 250 linjer, SKAL den splittes i mindre, fokuserede moduler.
- **MUST**: Komponenter SKAL foelge Single Responsibility Principle - en komponent, et ansvarsomraade.

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

## Secrets & Environment

- **NEVER**: Hardcode ALDRIG credentials, API-noegler eller andre hemmeligheder i kode.
- **MUST**: Brug environment variables via `.env` med Zod-validering ved opstart.
- **MUST**: Oprethold en `.env.example` med alle paakraevede variabler (uden vaerdier).

## Dependencies

- **MUST**: Foer brug af en ny pakke, verificer at den er installeret. Installer automatisk hvis den mangler.
- **NEVER**: Antag ALDRIG at target-maskinen allerede har dependencies.
