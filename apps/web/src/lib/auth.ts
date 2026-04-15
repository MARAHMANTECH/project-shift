// NextAuth.js — Fuld server-side konfiguration
// Importerer base config fra auth.config.ts (Edge-kompatibel)
// Tilføjer Credentials provider og andre server-only features

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

// Udvid med server-only providers (Credentials virker ikke i Edge)
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
};

// ── Export ────────────────────────────────────────────────────────────
const nextAuth = NextAuth(fullConfig);

export const handlers = nextAuth.handlers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: (...args: any[]) => any = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
