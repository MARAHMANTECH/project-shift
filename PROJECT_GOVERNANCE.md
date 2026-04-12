# Governance, Compliance & Regelsæt for Project SHIFT

Dette dokument samler og detaljerer samtlige systemarkitektoniske, sikkerhedsmæssige og designmæssige regler for platformen **Project SHIFT**. Enhver udviklingsindsats og ændring af systemet *skal* overholde disse retningslinjer.

---

## 1. Proces & Workflow Control (`.rules/01-process.md`)
Dette sæt af regler sikrer en forudsigelig, dokumenteret og sikker udviklingscyklus.

*   **Architecture First:** Der må *aldrig* genereres implementeringskode, før en `IMPLEMENTATION_PLAN.md` er udarbejdet og godkendt af brugeren. Planen skal indeholde formål, berørte filer, database-ændringer, sikkerhedsimplikationer og en verifikationsplan.
*   **Source of Truth:** Enhver ny session starter med at læse `SYSTEM_STATE.md`. Denne fil, samt `ARCHITECTURE.md` og `CHANGELOG.md` (Semantic Versioning), skal opdateres konsekvent efter hver afsluttet opgave. Derudover skal `PROJECT_GOVERNANCE.md` opdateres når regler i `.rules/`-filer ændres, tilføjes eller fjernes – governance-dokumentet er den samlede, læsbare oversigt og *skal* altid afspejle den aktuelle tilstand af samtlige `.rules/`-filer.
*   **Naming & Branding:** Al UI-tekst og referencer til produktnavnet skal trækkes fra en central `APP_CONFIG`-konstant. Produktnavnet må aldrig hardcodes i komponenter eller metadata.
*   **Fil-Organisation:** Nye filer oprettes i den korrekte modul-mappe. Barrel exports (`index.ts`) skal benyttes til at eksponere modul-grænseflader. Moduler skal altid holde sig under 250 linjer; overskrides dette, opsplittes de.

---

## 2. Tekniske Standarder & Kodekvalitet (`.rules/02-tech-standards.md`)
Garanterer en konsistent, effektiv og fejltolerant kodebase.

*   **Type Safety (Strict TypeScript):** Strict mode er obligatorisk. Typen `any` er **strengt forbudt**. API-kontrakter defineres som `interface` (ikke `type`). Zod benyttes til runtime-validering af alle eksterne inputs (requests, webhooks, formularer). Eksplicitte returtyper er påkrævet på alle funktioner og metoder – TypeScript's type inference må ikke erstatte deklarativ typespecifikation på funktionssignaturer.
*   **Geospatiale Beregninger:** Geografiske beregninger (afstand, accept-radius m.v.) foregår eksklusivt i databaselaget via PostGIS SQL-funktioner (f.eks. `ST_DWithin`, `ST_Distance`). Beregningskolonner er altid af typen `geography` (WGS 84 - SRID 4326), så jordens krumning håndteres korrekt. Dette må *aldrig* gøres i applikationslaget (f.eks. med JavaScript/TypeScript).
*   **API Design & Performance:** RESTful konventioner i NestJS. Fejl returneres skarpt i **RFC 7807 Problem Details format**. Tidsbudgettet for API-respons er maksimalt 300ms. Alle databasens foreign keys kræver databaser-indekser for optimal opslagstid. Prisma Client udvides med `$extends` til tenant-context opslag.
*   **Fejlhåndtering og Logging:** `try/catch` er obligatorisk sammen med meningsfulde fejlbeskeder. Fejl må aldrig ignoreres stiltiende ("swallowed exceptions"). Al output skal logges med nødvendig kontekst (`userId`, `organizationId`). Fejlmeddelelser der præsenteres i brugerfladen skal formuleres på forståeligt dansk uden tekniske termer. Stack traces, interne fejlkoder og systemdetaljer må *aldrig* eksponeres mod slutbrugeren – disse forbliver udelukkende i server-logs.
*   **Dependency Guard:** Inden kørsel af scripts eller installation af nye pakker, sikres det (ofte programmatisk automatiseret), at afhængigheder faktisk er installeret på maskinen (`npm install X` foretages ved fravær). Dette skal gælde uanset maskinen eller miljøet.
*   **Kode-Enkelthed (Single Responsibility Principle):** Funktioner må maksimalt udgøre **40 linjers kode**. Overskrider en funktion denne grænse, opbrydes den i kompositoriske hjælpefunktioner. Kombineret med modulers 250-linjers grænse sikrer dette en læsbar, testbar og vedligeholdelig kodebase.
*   **Export-Konventioner:** `default export` er **forbudt** på tværs af kodebasen. Alle eksporter skal være *named exports* for at sikre søgbarhed, refactoring-sikkerhed og konsistens med barrel exports (`index.ts`). *Undtaget* er Next.js App Router-filer (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`), som kræver default export iht. frameworkets konventioner.
*   **Adapter Pattern for Integrationer:** Tredjepartsintegrationer (betalingsgateways, kort-tjenester, e-mail-providers, analytics m.v.) skal implementeres via Adapter-mønsteret med en defineret `interface` og en konkret implementering. Dette muliggør hurtig udskiftning af leverandører uden at forretningslogikken berøres.
*   **Dato- og Tidsformatering:** Alle datoer i brugerfladen vises i dansk format (`DD-MM-ÅÅÅÅ`) via `Intl.DateTimeFormat` med `da-DK` locale. Intern lagring sker altid i ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`). Tidszoner håndteres eksplicit – `Europe/Copenhagen` er standard for visning.

---

## 3. Multi-Tenancy & Datasikkerhed (`.rules/03-multi-tenancy-security.md`)
Et af systemets absolut mest kritiske compliance-områder. Fejl her kompromitterer kundedata og tenant-isolation.

*   **Tenant Isolation Model (4-lags Sikkerhed):**
    1.  **Schema:** Enhver tabellerende tenant-data SKAL have en kolonne `organization_id` som foreign key samt tilhørende databaser-indeks.
    2.  **RLS (Row-Level Security):** PostgreSQL RLS er uomtvisteligt aktiveret på alle tenant-tabeller og filtrerer strengt på `organization_id = current_setting('app.current_org_id')`. Nye tabeller skal altid oprettes med `ENABLE ROW LEVEL SECURITY` som en del af migreringsskriptet – dette er ikke en efterfølgende tilføjelse.
    3.  **Application Layer:** Backend bruger `AsyncLocalStorage`-baseret Tenant Context middleware til automatisk at kende `organizationId` ud fra brugerens server-verificerede JWT (ikke overført fra klientinput).
    4.  **ORM:** Prisma ORM auto-injicerer en `WHERE organizationId`-klausul i  *samtlige* forespørgsler og mutations. Den rå (unscoped) Prisma Client må ikke anvendes i regulær forretningslogik.
*   **Destruktive Operationer:** Operationer såsom `DELETE` eller `UPDATE` må **aldrig** udføres uden eksisterende restriktion i form af `WHERE organization_id = ?`. Modeller anvender soft-delete (`deleted_at`), og alt logges i en `AuditLog`. "Dry-run" parameter skal altid understøttes før sletninger gøres permanente i scripts. Endvidere tages backup med ISO 8601-timestamp inden handling. Backup-filer navngives efter standarden: `backup_<tabel>_<YYYY-MM-DD>_<HHmm>.<format>` og gemmes i en dedikeret `backups/`-mappe.
*   **ESG Data Integrity (Compliance Rule):** Al CO2-beregning udføres i uafhængige *Pure Functions* uden sideeffekter, som ligger under ekstremt høje testkrav (100% unit test dækning). Loggede ESG-ture er *immutable*; modificering bagud er ikke tilladt. Beregningsformlen skal administreres og holdes centralt – det forbydes totalt at hardcode konstanter flere steder i applikationen.
*   **Authentication & Håndtering (Clerk):** Auth varetages gennem strikt implementering af `@clerk/nextjs/server` via metoder som `clerkMiddleware()` og den asynkrone `auth()`. Legacy implementationer (`authMiddleware`, `<SignedIn>`, `<SignedOut>`, Pages-routing) må slet og ret *aldrig* benyttes. JWT sessions bærer desuden en rolle (RBAC).
*   **Session-Sikkerhedspolitik (SEC-SESSION-001):** Logout-proceduren skal være *total og komplet*. Ved logout destrueres: (1) alle HTTP-only cookies relateret til auth, (2) al `localStorage`- og `sessionStorage`-data, (3) Clerk's aktive sessions og tokens. After logout udføres et **hard redirect** (`window.location.href = '/sign-in'`) – aldrig en client-side router navigation – for at sikre, at ingen cached state persisterer. Beskyttede sider skal serveres med `Cache-Control: no-store, no-cache, must-revalidate` headers via middleware, så browser-history ikke afslører autentificeret indhold efter logout.
*   **Impersonation:** Er eksklusivt for `SUPER_ADMIN`. Det logges fuldt ud i `ImpersonationLog` (inkl. tidsstempel) og etablerer et ubrydeligt visuelt impersonationsbanner i appen for at minimerer risici.
*   **User Privacy:** For at garantere anonymisering indsamles live GPS-tracking af brugere *aldrig*. De geospatiale data fra koordinator afrundes til maksimalt 3 decimaler (svarer derved til et geografisk slør på ca. 111 meter præcision). Sikkerhedsfunktionerne afvikles via `privacy.ts` helpers.
*   **Secrets & Credentials:** Hardcoding accepteres ikke under nogen omstændigheder. Al følsom information indhentes via `.env` variabler - og valideres via Zod under serverens spin-up fase.

---

## 4. UI/UX & Mobile-First Design (`.rules/04-ui-ux.md`)
Platformen bruges af pendlere. Mobiloplevelsen skal deraf prioriteres førend alt andet for maksimal bekvemmelighed.

*   **PWA-fokus:** Projektet bygges som en PWA (`manifest.json`, Service Workers) og skal kunne ligge på startskærmen ("Add to Homescreen"). Standardiserede touch targets må ikke være under 44x44 pixels (Apples HIG). Der kompenseres for mobilers "Safe-Area" (Notched/Island skærme).
*   **Server State (React Query):** Datahentning foregår over TanStack Query - her sikres server state caching. Gammeldags `useEffect` m. `fetch` må ikke udøves. Lav-latency optimering etableres ved brug af `optimistic updates`. "Spinnere" erstattes i stedet med "Skeleton Screens".
*   **UX Principper & Features:** Alt indhold og funktionssider skal bestå the "5-second test" (man skal på 5 sek. forstå sidens primære funktion). Ligeledes skjules modul-specifikke features via Role-baserede og "organization enabledModules" Feature Flags, så uautoriseret indhold ikke optager plads. Ikoner forventes ledsaget af støttende meningsfuld dansk tekst. For at reducere kognitiv belastning bør kritiske handlingssider præsentere maksimalt **3-5 primære valgmuligheder** synligt – yderligere funktionalitet foldes ind i kontekstmenuer.
*   **Destruktiv Handling i UI (ConfirmDialog-krav):** Enhver destruktiv handling i brugerfladen (sletning, arkivering, afmelding, masseopdatering) **skal** ledsages af en bekræftelsesdialog (`ConfirmDialog`). Dialogen skal tydeligt beskrive konsekvensen af handlingen på forståeligt dansk, fremhæve hvad der vil ske, og tilbyde en tydelig "Annuller"-mulighed. Den destruktive handlingsknap skal visuelt signalere fare (f.eks. dæmpet rød tone, aldrig ren rød – jf. branding-reglerne).
*   **Tilgængelighed (WCAG 2.1 AA):** Mennesker med nedsatte syns- eller motoriske-handicap honoreres via obligatoriske kontrastforhold på minimum 4,5:1. Alle interaktive elementer udrustes med stringente og præcise unikke id-attributter, labels og `alt`-tekster til skærmlæsere. Brødtekst skal have en minimum font-størrelse på **16px** for at sikre læsbarhed på mobile enheder og tablets.

---

## 5. Branding & Æstetik (`.rules/05-branding.md`)
Hovedfokusset er på en præmie-oplevelse. Konceptet kaldes the "Sustainable Concierge" (Editorial Organicism), hvis primære formål er at nedlægge ideen om, at et corporate mobility værktøj skal føles klinisk som standard enterprise-software.

*   **Visuel Retning:** Applikationen skal føles varm, organisk, tiltalende og troværdig, tydeligt inspireret af livstilsmagasiners kuratering (GoMore stil og look og layout).
*   **Farvepalette & Tonal Layers:** Rene formater (rød, grøn, blå) benyttes overhovedet ikke. Der trækkes i stedet på rolige naturvender: *Warm Sands* (#F5F2ED), *Forest Green* (#2D5A27), *Sun-kissed Orange* (#FF8C42). Systemet anvender faste "Surface Tiers" (farveskala). Sider har dark mode som standardvalg.
*   **"No-Line Rule":** Det er absolut ekspliciteret systemvidt at skabe design-kontraster uden deciderede "borders". Vi skaber adskillelse via afdæmpede "Ambient Shadows" (`shadow-xl` til lave procenter) samt lagdelt baggrundsfarve (Surface Highest til Surface Lowest). Afrundede kort/knapper (`border-radius` startende fra 16px). Også inputs er bløde og med *Glassmorphism*. Skygger skal have en let farvetoning (tinted shadows) frem for neutral grå – dette bevarer dybdefølelsen uden visuelt at bryde den organiske æstetik.
*   **Mikroanimationer:** Fade-in, "lift-on-hover" på elementer bidrager til appens organiske bevægelse i respons på handlinger. Loading og tjek bør altid "swipe" ubesværet frem.
*   **Typografi & Sprog:** Typografisk afhænger overskrifter af den larmende og personlighedsvækkende *Satoshi* (eller Bricolage Grotesque). Almindelig tekst bruger det læservenlige *Inter*. Tonen er formel men personlig ("Godmorgen, Lars"). I brugerfladen stiler man på pletfrit dansk (særligt vigtig for håndtering af specifikke karakterer).
*   **ESG Dashboard Gamification:** Klimaopsnuset CO2 reducerede data må *aldrig* kun kvantificeres numerisk. Data gøres levende og intuitiv at forholde sig til ved metaforiske repræsentationer som træer og voksende skove.

---

## 6. Zero-Tolerance Data & Eksekverings-Regler (Globale Core-regler)
*   **Dansk Kultur- og Sprogpolicy:** Samtlige AI-agenter og udviklere forvisses absolut "zero tolerance" overfor fraværte specialkarakterer i al tekst der dækker kommentarer, logninger og UI ("Æ", "Ø", "Å"). Karakterer erstattes aldrig nogensinde med sub-varianter ("ae", "oe"). Filbehandlende databaser sikres med UTF-8 uden BOM til gavn for alle.
*   **Nomenklatur:** Af systemtekniske årsager skal variabler, metoder, routes og databasetabeller *være og forblive fast forankret på letlæseligt engelsk* for international skalerbarhed (f.eks `organization_id`). Man designer koden teknisk på engelsk, men udtrykker interaktionen human-centric på dansk.
*   **Idempotens og Sikkerhed:** Hvad enten om handlinger tilføres via API eller kommando via skripts, skal de designes idempotente - hvilket vil sige systemet evaluerer nuværende niveau *før* en handling gentages. Eventuelle rollback stier dokumenteres fyldestgørende. Backup-filer navngives med ISO 8601-timestamp efter formatet `backup_<kontekst>_<YYYY-MM-DD>_<HHmm>.<format>` og opbevares i en dedikeret `backups/`-mappe. Håndtering af fejl skal føre til en "Graceful exit", og fejl må aldrig stiltiende fejles, men logges med gennemsigtighed for driftens overvågethed.
