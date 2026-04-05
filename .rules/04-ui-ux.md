# 04 - UI/UX & Mobile-First Design

> Disse regler styrer brugeroplevelsen i Project SHIFT.
> Platformen er en PWA designet til daglig brug af pendlere - mobil-foerst er ikke valgfrit.

---

## Progressive Web App (PWA)

- **MUST**: Implementer PWA med `manifest.json`, service worker, og offline-support.
- **MUST**: Appen SKAL vaere installerbar paa mobile enheder via "Tilfoej til startskærm".
- **MUST**: Touch targets SKAL vaere minimum 44x44px (Apple HIG standard).
- **MUST**: Brug safe-area padding til enheder med notch/Dynamic Island.

## Mobile-First Responsivitet

- **MUST**: Design ALTID mobil-foerst. Desktop-layout er en udvidelse, ikke omvendt.
- **MUST**: Breakpoints SKAL foelge en konsistent skala:
  - `sm`: 640px (stor mobil)
  - `md`: 768px (tablet)
  - `lg`: 1024px (desktop)
  - `xl`: 1280px (stor desktop)
- **MUST**: Bundnavigation til mobil, sidebjælke-navigation til desktop.
- **NEVER**: Brug ALDRIG hover-only interaktioner. Alt SKAL vaere tilgaengeligt via touch.

## Server State Management

- **MUST**: Brug **React Query** (TanStack Query) til al server-state.
- **MUST**: Definer standardiseret fejlhaandtering i en central `queryClient` konfiguration.
- **MUST**: Implementer optimistic updates for handlinger der kraever lav latency (booking, RSVP).
- **NEVER**: Brug ALDRIG `useEffect` + `fetch` til data-hentning. Brug React Query hooks.
- **MUST**: Cache-strategier SKAL vaere dokumenterede pr. query-type (staleTime, gcTime).

## Design System

- **MUST**: Brug en konsistent farvepalet defineret i CSS custom properties (`--color-*`).
- **MUST**: Typografi SKAL bruge Inter (eller tilsvarende moderne sans-serif) via `next/font`.
- **MUST**: Brug glassmorphism, subtile gradienter og mikro-animationer for premium-foelelse.
- **MUST**: Dark mode SKAL undersstoettes som standard.
- **NEVER**: Brug ALDRIG generiske farver (ren roed, blaa, groen). Kurater harmoniske paletter.

## UX Principper

- **MUST**: Alle sider SKAL bestaa "The 5-second test" - en ny bruger SKAL kunne forstaa formålet inden for 5 sekunder.
- **MUST**: Brug ikoner kombineret med klar dansk tekst. Ikoner alene er utilstraekkelige.
- **MUST**: Fejlbeskeder SKAL vaere paa dansk, venlige, og handlingsrettede ("Proev igen" ikke bare "Fejl").
- **MUST**: Loading states SKAL vises med skeleton screens, ikke spinnere.
- **MUST**: Tomme tilstande SKAL have illustrationer og opfordringer til handling.

## Feature Flags & Modulaer UI

- **MUST**: UI-komponenter for moduler (Rides, Community, Analytics) SKAL respektere `enabledModules` fra organisationens konfiguration.
- **MUST**: Deaktiverede moduler SKAL skjules fra navigation - vis ikke "laaste" features.
- **NEVER**: Vis ALDRIG data fra et modul som organisationen ikke har adgang til.

## Tilgaengelighed (a11y)

- **MUST**: Alle interaktive elementer SKAL have unikke, beskrivende `id`-attributter.
- **MUST**: Farvekontrast SKAL overholde WCAG 2.1 AA (minimum 4.5:1 for tekst).
- **MUST**: Alle billeder SKAL have `alt`-tekst.
- **MUST**: Formularer SKAL have associerede `<label>`-elementer.
