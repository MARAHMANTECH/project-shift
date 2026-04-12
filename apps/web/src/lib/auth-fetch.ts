// Authenticated fetch wrapper
// Tilføjer automatisk Authorization: Bearer <token> header til API-kald
// Bruger NextAuth session til at hente auth-token

import { APP_CONFIG } from "@/config/app";

/**
 * Opret en authenticated fetch-funktion med session token.
 *
 * @param getToken - Token-provider funktion (fra NextAuth session)
 * @returns En fetch wrapper der automatisk tilføjer auth headers
 *
 * @example
 * ```tsx
 * const fetchWithAuth = createAuthFetch(async () => session?.accessToken ?? null);
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
 * Bruger NextAuth's auth() helper direkte.
 *
 * @example
 * ```tsx
 * import { auth } from "@/lib/auth";
 *
 * export default async function ServerPage() {
 *   const session = await auth();
 *   const fetchWithAuth = createAuthFetch(async () => null);
 *   const data = await fetchWithAuth("/api/v1/rides");
 * }
 * ```
 */
