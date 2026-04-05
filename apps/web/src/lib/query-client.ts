// React Query client configuration
// Per .rules/04-ui-ux.md: standardized error handling, cache strategies documented

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 30 seconds for most data
        staleTime: 30 * 1000,
        // Garbage collection: 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry 2 times on failure
        retry: 2,
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: true,
      },
      mutations: {
        // Show error toast on mutation failure
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Der opstod en fejl. Prøv venligst igen.";
          console.error("[MUTATION_ERROR]", message);
        },
      },
    },
  });
}

// Singleton for client-side use
export const queryClient = createQueryClient();
