"use client";

// AuthTokenProvider — kobler Clerk auth til API client
// Sættes op i provider-hierarkiet så alle API-kald
// automatisk inkluderer Clerk JWT i Authorization header

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthTokenProvider } from "@/lib/api-client";

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenProvider(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
