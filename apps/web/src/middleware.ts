// NextAuth.js Middleware — beskytter alle ruter undtagen offentlige
// Bruger NextAuth auth() som middleware wrapper
// Per ARCHITECTURE.md: Uautoriserede brugere redirectes til /login

export { auth as default } from "@/lib/auth";

export const config = {
  matcher: [
    // Skip Next.js internals og statiske filer
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Kør altid for API-ruter (undtagen /api/auth)
    "/(api(?!/auth)|trpc)(.*)",
  ],
};
