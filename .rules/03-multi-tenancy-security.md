# 03 - Multi-Tenancy & Data Security

> Disse regler beskytter dataintegritet og tenant-isolation i Project SHIFT.
> Overtraedelse af disse regler er en **kritisk sikkerhedsfejl**.

---

## Tenant Isolation (4-Lags Model)

### Lag 1: Database Schema
- **MUST**: ENHVER tabel SKAL indeholde en `organization_id` foreign key til `organizations`-tabellen.
- **NEVER**: Opret ALDRIG en tabel uden `organization_id` (undtagen lookup-tabeller og systemtabeller).
- **MUST**: Tilfoej et databaseindeks paa `organization_id` for ALLE tabeller.

### Lag 2: Row-Level Security (RLS)
- **MUST**: PostgreSQL RLS policies SKAL være aktive på ALLE tenant-tabeller.
- **MUST**: RLS policies SKAL filtrere på `organization_id = current_setting('app.current_org_id')`.
- **MUST**: Nye tabeller SKAL altid oprettes med `ENABLE ROW LEVEL SECURITY` som en del af migreringsskriptet – dette er ikke en efterfølgende tilføjelse.
- **NEVER**: Deaktiver ALDRIG RLS i production.

### Lag 3: Application Layer
- **MUST**: Brug `AsyncLocalStorage`-baseret tenant context til at propagere `organizationId` gennem requests.
- **MUST**: Alle API route handlers SKAL kalde `getTenantContext()` som foerste handling.
- **NEVER**: Accepter ALDRIG `organization_id` fra client-side input. Den SKAL altid komme fra den autentificerede session.

### Lag 4: ORM Layer
- **MUST**: Prisma client SKAL bruge `$extends` til automatisk at injicere `organizationId` i ALLE queries og mutations.
- **NEVER**: Brug ALDRIG den raa (unscoped) Prisma client i tenant-kontekst. Kun Super Admin-operationer maa bruge unscoped client.

## Destruktive Operationer

- **NEVER**: Udforer ALDRIG `DELETE`, `UPDATE`, eller `DROP` uden en eksplicit `WHERE organization_id = ?` klausul.
- **MUST**: Alle destruktive operationer SKAL logges i `AuditLog` med `organization_id`, `user_id`, `action`, og `entity`.
- **MUST**: Implementer soft-delete (`deleted_at` timestamp) i stedet for hard-delete paa alle bruger- og forretningsdata.
- **MUST**: Understoet `--dry-run` parameter paa alle destruktive admin-operationer.

## ESG Data Integrity

- **MUST**: CO2-beregningslogik SKAL isoleres i **pure functions** uden sideeffekter.
- **MUST**: Pure functions SKAL have tilhoerende unit tests med kendte input/output-par.
- **MUST**: ESG-data SKAL vaere immutable efter tur-completion. Ingen efterfoelgende redigering tilladt.
- **MUST**: CO2-beregningsformlen SKAL vaere dokumenteret og versioneret i `ARCHITECTURE.md`.
- **NEVER**: Beregn ALDRIG CO2 med hardcodede konstanter spredt i kodebasen. Brug en central konfiguration.

## Authentication & Authorization

- **MUST**: Brug Clerk Auth til alle autentificerings-flows.
- **MUST**: JWT sessions SKAL baere `organizationId`, `userId`, og `role`.
- **MUST**: Implementer rollebaseret adgang (RBAC): `MEMBER`, `ORG_ADMIN`, `SUPER_ADMIN`.
- **NEVER**: Stol ALDRIG paa client-side rollevalidering alene. Valider ALTID rolle paa server.

## Impersonation

- **MUST**: Kun `SUPER_ADMIN` maa impersonere andre brugere.
- **MUST**: Alle impersonation-sessioner SKAL logges i `ImpersonationLog` med start/slut-tidspunkt.
- **MUST**: Impersonation SKAL vaere visuelt markeret med en tydelig banner i UI.
- **NEVER**: Tillad ALDRIG impersonation af andre `SUPER_ADMIN`-brugere.

## Privacy

- **MUST**: GPS-koordinater SKAL afrundes til 3 decimaler (ca. 111 meter praecision).
- **NEVER**: Implementer ALDRIG live GPS-tracking af brugere.
- **MUST**: Brug `privacy.ts` helper-funktioner til al GPS-data-behandling.

## Backup & Rollback

- **MUST**: Før enhver destruktiv handling, opret backup af den aktuelle tilstand.
- **MUST**: Backup-filer SKAL navngives efter standarden: `backup_<tabel>_<YYYY-MM-DD>_<HHmm>.<format>` og gemmes i en dedikeret `backups/`-mappe.
- **MUST**: Dokumenter rollback-procedurer for alle kritiske operationer.

## Session-Sikkerhedspolitik (SEC-SESSION-001)

- **MUST**: Logout-proceduren SKAL være total og komplet. Ved logout destrueres:
  1. Alle HTTP-only cookies relateret til auth
  2. Al `localStorage`- og `sessionStorage`-data
  3. Clerk's aktive sessions og tokens
- **MUST**: Efter logout udføres et **hard redirect** (`window.location.href = '/sign-in'`) – aldrig en client-side router navigation.
- **MUST**: Beskyttede sider SKAL serveres med `Cache-Control: no-store, no-cache, must-revalidate` headers via middleware.
- **NEVER**: Brug ALDRIG `router.push()` til logout-redirect – cached state kan persistere.
