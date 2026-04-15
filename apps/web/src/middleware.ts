// NextAuth.js Middleware — beskytter alle ruter undtagen offentlige
// Bruger Edge-kompatibel auth config (INGEN Prisma, INGEN Credentials)
// Per ARCHITECTURE.md: Uautoriserede brugere redirectes til /login

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  
  // JWT token fra Auth.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = req.auth as any; 

  // 1. Fast-path: Skip auth overhead for statiske filer og API login-ruter
  if (
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.match(/\.(.*)$/)
  ) {
    return;
  }

  // 2. Ikke logget ind → redirect til login
  if (!isLoggedIn && !nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 3. --- ENTRA ID GROUP VALIDATION (0ms DB-latency) ---
  const requiredGroupId = token?.tenantRequiredGroupId;
  const userGroups = token?.groups || [];

  if (requiredGroupId && typeof requiredGroupId === "string") {
    const isSuperAdmin = token?.role === "SUPER_ADMIN";
    
    if (!isSuperAdmin && !userGroups.includes(requiredGroupId)) {
       if (!nextUrl.pathname.startsWith("/unauthorized")) {
         return Response.redirect(new URL("/unauthorized", nextUrl));
       }
    }
  }

  // 4. Allerede logget ind på /login → redirect til Dashboard
  if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
