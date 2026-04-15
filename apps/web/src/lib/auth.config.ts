// Auth Config — Edge-kompatibel konfiguration (INGEN Prisma, INGEN Credentials)
// Denne fil importeres af middleware.ts (Edge Runtime)
// Den fulde auth.ts bygger oven på denne med server-only features

import type { NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// ── Type Declarations ──────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    azureAdOid?: string;
    azureTenantId?: string;
    provider?: string;
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    azureAdOid?: string;
    azureTenantId?: string;
    provider?: string;
    role?: string;
    groups?: string[];
    tenantRequiredGroupId?: string;
  }
}

// ── Edge-kompatibel Auth Config ────────────────────────────────────
export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: "https://login.microsoftonline.com/common/v2.0",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 timer — sikrer hurtig group-invalidation
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as Record<string, unknown>;

        token.email = (p.email ?? p.preferred_username) as string;
        token.name = (p.name ?? `${p.given_name ?? ""} ${p.family_name ?? ""}`.trim()) as string;
        token.picture = p.picture as string | undefined;
        token.azureAdOid = (p.oid ?? profile.sub) as string;
        token.azureTenantId = p.tid as string;
        token.provider = account.provider;

        if (account.access_token) {
          token.accessToken = account.access_token;
        }

        // --- ENTRA ID GROUPS ---
        if (p.groups && Array.isArray(p.groups)) {
          token.groups = p.groups as string[];
        } else {
          token.groups = [];
        }
        
        // --- BRUGERROLLE & TENANT CONFIG ---
        // Rollen hentes IKKE her (ville skabe cirkulær request til egen server).
        // I stedet slås den op via /api/auth/user-config i session() på server-side,
        // eller direkte i de API routes der har brug for den.
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.image = token.picture as string | undefined;
      }

      session.accessToken = token.accessToken;
      session.azureAdOid = token.azureAdOid;
      session.azureTenantId = token.azureTenantId;
      session.provider = token.provider;
      session.role = token.role;
      // @ts-ignore
      session.groups = token.groups;
      // @ts-ignore
      session.tenantRequiredGroupId = token.tenantRequiredGroupId;

      return session;
    },

    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/manifest.json" ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/illustrations")
      ) {
        return true;
      }

      if (pathname.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }

      return isLoggedIn;
    },
  },
};
