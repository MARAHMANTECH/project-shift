// Clerk Auth Middleware — beskytter alle ruter undtagen offentlige
// Per ARCHITECTURE.md: Uautoriserede brugere redirectes til /login
// Super Admin ruter kræver SUPER_ADMIN rolle i Clerk publicMetadata

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Offentlige ruter der IKKE kræver autentificering:
 * - /login: Login-siden
 * - /sign-up: Registrering (deaktiveret i B2B, men klar til fremtidig brug)
 * - /api/webhooks: Clerk webhook-endpoint til bruger-sync
 */
const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

/** Super Admin ruter kræver SUPER_ADMIN rolle */
const isSuperAdminRoute = createRouteMatcher(["/admin/super(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  // Alle ikke-offentlige ruter kræver login
  await auth.protect();

  // Super Admin ruter: tjek rolle i publicMetadata
  if (isSuperAdminRoute(req)) {
    const session = await auth();
    const metadata = session.sessionClaims?.publicMetadata as
      | Record<string, unknown>
      | undefined;
    const role = metadata?.role as string | undefined;

    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals og statiske filer
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Kør altid for API-ruter
    "/(api|trpc)(.*)",
  ],
};

