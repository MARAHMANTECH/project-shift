# Deployment, Risk Analysis & Rollbacks
Dette dokument dikterer kravene til deployment-livscyklus, samt håndtering af kritiske opdateringer i Project SHIFT platformen. Reglerne skal altid overholdes, før kode flettes ind i `main`-branchen.

---

## 0. Zero-Bug Policy (Ufravigelig)

> Denne politik er absolut og sikrer 100% stabil drift for Project SHIFT. Ingen undtagelser.

*   **Intet** må pushes direkte til `main` (production).
*   Alle ændringer SKAL først committes, bygges, testes og verificeres i `development`-miljøet.
*   Lokale builds (`npm run build`) SKAL gennemføres uden fejl før enhver commit.
*   Ved fejl i production rulles der straks tilbage til forrige stabile build, og fejlen rettes i `development`.

---

## 1. Krav til Change Management Pakke (CMP)
Før enhver kritisk ændring, ændring af infrastrukturydelser (fx. Auth-udbyder) eller større databasemodificeringer påbegyndes, skal der fremlægges en komplet **Change Management Pakke**. Koden må *aldrig* skrives eller flettes uden en godkendelse (Test Sign-off). Pakken skal indeholde 4 udtømmende sektioner:

*   **Implementation Plan:** Teknisk beskrivelse af udskiftnings- og opbygningsprocessen.
*   **Risk & Impact Analysis:** Dokumenteret analyse af, hvilke brugerdata der berøres, effekten på oppetid (downtime), sikkerhedsimplikationer og sideindlæsningsmetrikker (performance lag).
*   **Rollback Plan:** En klar, operationel trin-for-trin beredskabsplan til at tilbageføre systemet (revert), hvis processen korrumperer eller fejler (f.eks. ved API-håndtryk i production).
*   **Test Plan:** Hvilke specifikke manuelle og automatiserede QA-scenarier, som det udviklende team *skal* tjekke igennem lokalt og/eller på dev-bænken.

## 2. Hard Rollback Standarder
Enhver Rollback Plan *skal* opfylde følgende standarder for at være gyldig i Project SHIFT:
1.  **Zero-Destruction Migrations:** Kritiske kolonner eller data-bindinger (som UUID'er fra forældede tjenester) må aldrig "hard-deletes" ud af tabellerne i samme Commit som migreringen. De skal omdøbes til `_deprecated_navn` i minimum 1 livscyklus (f.eks. ved hjælp af Prisma-migreringer), således et tilbagerul ikke resulterer i en defekt database med permanent data-tab.
2.  **Stateless Toggles:** Hvor det er muligt, skiftes Auth-tjenester via `APP_ENV` bundne miljø-variabler, hvortil deaktivering af disse øjeblikkeligt nulstiller klienten og genetablerer tidligere virkelighed.

## 3. Test & Performance Requirements i Dev
Ingen funktioner accepteres til production (`main`), hvis de forværrer brugeroplevelsen i dev-miljøet (`development`).
*   **Applikationsnavigation (Routing):** Tidsbudgettet under skift i React-interne ruter målet ikke overskride 200ms. Omfattende middlewares der sinker asset-load (som statiske CSS-filer, ikoner) skal fast-pathes udenom tunge kald.
*   **Auth Verification:** Hvis bruger-session håndtering fejler (login loops, manglende tenant-sync), trækkes deployet direkte tilbage til test-bænken.

## 4. Release Checklist — The Gatekeeper

> Før en ændring merges fra `development` til `main`, SKAL hvert punkt i denne checkliste være opfyldt.  
> Mangler ét punkt, **afvises mergen**.

| # | Kontrol | Ansvarlig | Verifikation |
|---|---------|-----------|-------------|
| 1 | **Build**: `npm run build` kører uden fejl lokalt | Udvikler | Terminal output (exit code 0) |
| 2 | **Version**: `package.json` version er korrekt inkrementeret (SemVer) | Udvikler | `npm run verify-release` |
| 3 | **CHANGELOG.md**: Ny entry med korrekt versionsnummer, dato og ændringsbeskrivelse | Udvikler | Manuel review |
| 4 | **SYSTEM_STATE.md**: Milestones og status reflekterer ændringen | Udvikler | Manuel review |
| 5 | **ARCHITECTURE.md**: Opdateret hvis nye moduler, services eller entiteter er tilføjet | Udvikler | Manuel review |
| 6 | **Dev-miljø test**: Ændringen er deployet og testet på Railway Development | QA / Systemejer | Railway logs + funktionstest |
| 7 | **Test Sign-off**: Eksplicit "OK" kvitteret i PR eller logfil | QA / Systemejer | PR kommentar eller log-entry |

### Automatiseret Verifikation
Kør `npm run verify-release` (eller `bash scripts/verify-release.sh`) for at automatisere punkt 1, 2 og dele af 3-5. Se scriptets output for detaljeret rapport.

## 5. Udrulning / Approval
Et pull request (`development` → `main`) godkendes *udelukkende* når QA eller systemejer har kvitteret ind i loggen med **"Test Sign-off"**. Forud for dette sættes agent-operationer på standby.
