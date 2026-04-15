# 01 - Workflow & Process Control

> Disse regler styrer den overordnede udviklingsproces for Project SHIFT.
> Alle AI-agenter og udviklere SKAL overholde dem uden undtagelse.

---

## Architecture First

- **MUST**: Generer ALDRIG implementeringskode foer en `IMPLEMENTATION_PLAN.md` er oprettet OG godkendt af brugeren.
- **MUST**: Planen SKAL indeholde: Formaal, berorte filer, database-ændringer, sikkerhedsimplikationer, og verifikationsplan.
- **NEVER**: Spring ALDRIG planlaegningsfasen over, uanset hvor "simpel" opgaven virker.

## Source of Truth

- **MUST**: Start ALTID en ny session med at laese `SYSTEM_STATE.md` i projektets rod.
- **MUST**: Opdater `SYSTEM_STATE.md` efter HVER afsluttet opgave med: faerdiggjorte filer, aktuel milestone, og naeste skridt.
- **MUST**: Opdater `ARCHITECTURE.md` naar nye moduler, services eller database-entiteter tilfojes.
- **MUST**: Opdater `CHANGELOG.md` med alle aendringer i Semantic Versioning format.
- **MUST**: Opdater `PROJECT_GOVERNANCE.md` når regler i `.rules/`-filer ændres, tilføjes eller fjernes. Governance-dokumentet er den samlede, læsbare oversigt og SKAL altid afspejle den aktuelle tilstand af alle `.rules/`-filer.

## Naming & Branding

- **MUST**: Alt UI-tekst og referencer til produktnavnet SKAL hentes fra en central `APP_CONFIG` konstant i `src/config/app.ts`.
- **MUST**: Brug vaerdien `"Project SHIFT"` som standard-produktnavn indtil en officiel lancering.
- **NEVER**: Hardcode ALDRIG produktnavnet direkte i komponenter, metadata eller dokumentation.

## Session Workflow

1. Laes `SYSTEM_STATE.md` - forstaa kontekst
2. Modtag opgave fra bruger
3. Opret `IMPLEMENTATION_PLAN.md` - faa godkendelse
4. Implementer ifoelge plan
5. Verificer (tests, browser, lint)
6. Opdater `SYSTEM_STATE.md`, `ARCHITECTURE.md`, `CHANGELOG.md`

## Fil-Organisation

- **MUST**: Opret nye filer i den korrekte modul-mappe (se `ARCHITECTURE.md`).
- **NEVER**: Placer ALDRIG kode i rod-mappen med mindre det er en konfigurationsfil.
- **MUST**: Brug barrel exports (`index.ts`) til at eksponere modul-grænseflader.

## Dev-First Mandate (Zero-Bug Policy)

> Denne politik er ufravigelig og sikrer 100% stabil drift for Project SHIFT.

- **NEVER**: Push ALDRIG direkte til `main` (production). Alle ændringer SKAL først committes og testes på `development`-branchen.
- **MUST**: Lokale builds (`npm run build`) SKAL gennemføres uden fejl før enhver commit.
- **MUST**: Kør `npm run verify-release` (eller `bash scripts/verify-release.sh`) inden oprettelse af PR fra `development` → `main`.
- **MUST**: Ingen merge til `main` uden eksplicit **"Test Sign-off"** fra manuel eller automatiseret gennemgang i dev-miljøet.
- **MUST**: Ved fejl i production rulles der straks tilbage til forrige stabile build, og fejlen rettes i `development`.
- **MUST**: Før en merge til `main` SKAL følgende dokumentation være opdateret:
  1. **Version**: `package.json` version inkrementeret korrekt (SemVer)
  2. **CHANGELOG.md**: Præcis beskrivelse af ændringen (Feature, Fix eller Forbedring)
  3. **SYSTEM_STATE.md**: Milestones og aktuel status reflekterer ændringen
  4. **ARCHITECTURE.md**: Opdateret hvis nye moduler, services eller entiteter er tilføjet
