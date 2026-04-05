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
