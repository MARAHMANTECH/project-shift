// Authenticated fetch wrapper
// Tilføjer automatisk Authorization: Bearer <token> header til API-kald
// Bruger Clerk's useAuth().getToken() til at hente session-token

import { APP_CONFIG } from "@/config/app";

/**
 * Opret en authenticated fetch-funktion med Clerk session token.
 *
 * @param getToken - Clerk's getToken funktion fra useAuth() hook
 * @returns En fetch wrapper der automatisk tilføjer auth headers
 *
 * @example
 * ```tsx
 * const { getToken } = useAuth();
 * const fetchWithAuth = createAuthFetch(getToken);
 * const data = await fetchWithAuth("/api/v1/rides");
 * ```
 */
export function createAuthFetch(
  getToken: () => Promise<string | null>
): (path: string, options?: RequestInit) => Promise<Response> {
  return async (path: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getToken();

    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");

    const url = path.startsWith("http")
      ? path
      : `${APP_CONFIG.apiUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        title: "Netværksfejl",
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(
        errorBody.detail ?? errorBody.message ?? `Fejl: ${response.status}`
      );
    }

    return response;
  };
}

/**
 * Server-side authenticated fetch (til brug i Server Components / Route Handlers).
 * Bruger Clerk's auth() helper direkte.
 *
 * @example
 * ```tsx
 * import { auth } from "@clerk/nextjs/server";
 *
 * export default async function ServerPage() {
 *   const { getToken } = await auth();
 *   const fetchWithAuth = createAuthFetch(getToken);
 *   const data = await fetchWithAuth("/api/v1/rides");
 * }
 * ```
 */
