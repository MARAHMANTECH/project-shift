// NextAuth.js — Fuld server-side konfiguration
// Importerer base config fra auth.config.ts (Edge-kompatibel)
// Tilføjer Credentials provider og JIT User Provisioning via Prisma

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "./db";

// Udvid med server-only providers og database-integration
const fullConfig = {
  ...authConfig,
  providers: [
    ...authConfig.providers,
    ...(process.env.ENABLE_CREDENTIALS_LOGIN === "true"
      ? [
          Credentials({
            id: "credentials",
            name: "Email & Adgangskode",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Adgangskode", type: "password" },
            },
            async authorize(credentials) {
              const email = credentials?.email as string | undefined;
              const password = credentials?.password as string | undefined;
              if (!email || !password) return null;
              return null;
            },
          }),
        ]
      : []),
  ],

  // JIT User Provisioning — opretter/opdaterer brugere i databasen ved hvert login
  events: {
    async signIn({ user, account, profile }: { user: any; account?: any; profile?: any }) {
      try {
        const email = user.email;
        if (!email) return;

        const p = (profile ?? {}) as Record<string, unknown>;
        const firstName = (p.given_name ?? p.givenName ?? "") as string;
        const lastName = (p.family_name ?? p.surname ?? "") as string;
        const externalId = (p.oid ?? p.sub ?? user.id ?? "unknown") as string;

        // Find brugerens organisation baseret på email-domæne
        const domain = email.split("@")[1]?.toLowerCase();
        let organizationId: string | null = null;

        if (domain) {
          const emailDomain = await prisma.emailDomain.findFirst({
            where: { domain },
            select: { organizationId: true },
          });
          organizationId = emailDomain?.organizationId ?? null;
        }

        // Opret organisation hvis ingen matcher (fallback for første bruger)
        if (!organizationId) {
          const defaultOrg = await prisma.organization.upsert({
            where: { slug: "default" },
            update: {},
            create: {
              name: "Standard Organisation",
              slug: "default",
            },
          });
          organizationId = defaultOrg.id;
        }

        // Upsert bruger — opretter ved første login, opdaterer ved efterfølgende
        await prisma.user.upsert({
          where: { email },
          update: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            externalAuthId: externalId,
          },
          create: {
            email,
            firstName: firstName || "Ukendt",
            lastName: lastName || "Bruger",
            externalAuthId: externalId,
            organizationId,
            role: "MEMBER", // Standard rolle — Super Admin tildeles manuelt
          },
        });
      } catch (error) {
        // Log fejl men lad ikke login fejle pga. database-problemer
        console.error("JIT User Provisioning fejlede:", error);
      }
    },
  },

  callbacks: {
    ...authConfig.callbacks,

    // Tilføj rolle fra databasen til JWT token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, profile, trigger }: { token: any; account?: any; profile?: any; trigger?: string }) {
      // Kør base jwt callback først
      if (authConfig.callbacks?.jwt) {
        token = await (authConfig.callbacks.jwt as Function)({ token, account, profile, trigger });
      }

      // Hent rolle fra database ved login eller token-refresh
      if (account || trigger === "update") {
        try {
          const email = token.email;
          if (email) {
            const dbUser = await prisma.user.findUnique({
              where: { email },
              select: { role: true, organizationId: true, organization: { select: { entraGroupId: true } } },
            });
            if (dbUser) {
              token.role = dbUser.role;
              token.organizationId = dbUser.organizationId;
              token.tenantRequiredGroupId = dbUser.organization?.entraGroupId;
            }
          }
        } catch (error) {
          console.error("Kunne ikke hente rolle fra DB:", error);
        }
      }

      // Optimize JWT size by trimming the massive Entra ID groups array
      if (token.tenantRequiredGroupId && Array.isArray(token.groups) && token.groups.includes(token.tenantRequiredGroupId)) {
        token.groups = [token.tenantRequiredGroupId as string];
      } else {
        token.groups = [];
      }

      return token;
    },
  },
};

// ── Export ────────────────────────────────────────────────────────────
const nextAuth = NextAuth(fullConfig);

export const handlers = nextAuth.handlers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: (...args: any[]) => any = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
