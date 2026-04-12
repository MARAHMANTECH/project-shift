"use client";

// AuthTokenProvider — kobler NextAuth session til API client
// Performance: Bruger session-data direkte fra memory (ingen HTTP-kald)
// Token hentes fra useSession() → session.accessToken

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAuthTokenProvider } from "@/lib/api-client";

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Sæt token-provider til at levere accessToken direkte fra session
    // Ingen fetch() → ingen ekstra latency (0ms i stedet for 50-100ms)
    setAuthTokenProvider(async () => {
      return session?.accessToken ?? null;
    });
  }, [session]);

  return <>{children}</>;
}
