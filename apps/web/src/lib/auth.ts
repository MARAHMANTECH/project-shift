// NextAuth.js konfiguration — Microsoft Entra ID + skjult credentials-fallback
// Multi-tenant: Bruger "common" endpoint for alle Azure AD tenants
// JIT Provisioning: Opretter brugere automatisk via email-domain → Organization
// Performance: accessToken gemmes i JWT for instant API-kald (ingen ekstra fetch)

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

// ── Type Declarations ──────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    azureAdOid?: string;
    azureTenantId?: string;
    provider?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    azureAdOid?: string;
    azureTenantId?: string;
    provider?: string;
  }
}

// ── Provider Konfiguration ─────────────────────────────────────────
export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      // issuer "common" = multi-tenant — alle Azure AD tenants kan logge ind
      issuer: "https://login.microsoftonline.com/common/v2.0",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),

    // Skjult credentials-fallback — kun aktiv når ENABLE_CREDENTIALS_LOGIN=true
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
              // TODO: Implementer bcrypt-verifikation mod User.passwordHash
              return null;
            },
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 timer — arbejdsdag
  },

  // ── Callbacks ──────────────────────────────────────────────────────
  callbacks: {
    /**
     * JWT callback — køres ved login og ved hver token-refresh
     * Gemmer Entra ID claims (oid, tid) + access_token i JWT
     */
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as Record<string, unknown>;

        // Bruger-identitet fra Entra ID
        token.email = (p.email ?? p.preferred_username) as string;
        token.name = (p.name ?? `${p.given_name ?? ""} ${p.family_name ?? ""}`.trim()) as string;
        token.picture = p.picture as string | undefined;

        // Entra ID claims til multi-tenancy
        token.azureAdOid = (p.oid ?? profile.sub) as string;
        token.azureTenantId = p.tid as string;
        token.provider = account.provider;

        // Access token — bruges til API-kald fra frontend
        // Gemmes i JWT så AuthTokenProvider kan levere det direkte fra memory
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
      }

      return token;
    },

    /**
     * Session callback — eksponerer JWT-data til klienten
     * accessToken er tilgængelig via useSession().data.accessToken
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.image = token.picture as string | undefined;
      }

      // Multi-tenant context + access token
      session.accessToken = token.accessToken;
      session.azureAdOid = token.azureAdOid;
      session.azureTenantId = token.azureTenantId;
      session.provider = token.provider;

      return session;
    },

    /**
     * Authorized callback — middleware bruger denne til route protection
     * Optimeret: Statiske assets skippes explicit for at undgå auth-overhead
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // ── Fast-path: Skip auth for statiske resurser ──
      if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/manifest.json" ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/illustrations")
      ) {
        return true;
      }

      // Login-side: redirect til dashboard hvis allerede logget ind
      if (pathname.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }

      // Alle andre ruter kræver login
      return isLoggedIn;
    },
  },
};

// ── Export ────────────────────────────────────────────────────────────
const nextAuth = NextAuth(authConfig);

export const handlers = nextAuth.handlers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: (...args: any[]) => any = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
