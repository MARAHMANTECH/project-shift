// APP_CONFIG - Central branding and configuration
// Per .rules/01-process.md: All UI text and product name references
// MUST be sourced from this constant. NEVER hardcode the product name.

export const APP_CONFIG = {
  /** Product name - will change at official launch */
  name: "Project SHIFT",

  /** Short tagline for meta descriptions */
  tagline: "Grønnere pendling, stærkere fællesskab",

  /** Full description */
  description:
    "Den lukkede platform for virksomheder der kombinerer samkørsel, ESG-rapportering og community events.",

  /** API base URL */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",

  /** Default locale */
  locale: "da-DK",

  /** Support email */
  supportEmail: "support@project-shift.dk",
} as const;

export type AppConfig = typeof APP_CONFIG;
