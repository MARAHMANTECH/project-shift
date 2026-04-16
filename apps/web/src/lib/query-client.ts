// React Query client configuration
// Per .rules/04-ui-ux.md: standardized error handling, cache strategies
// Performance: 5 min staleTime eliminerer re-fetch ved side-navigation

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 30 minutter — data betragtes som "frisk" i 30 min
        // Eliminerer unødvendige re-fetches ved side-skift til dashboard komponenter
        staleTime: 30 * 60 * 1000,
        // Garbage collection: 60 minutter — cache lever længe nok til
        // at brugeren kan navigere frem og tilbage uden data-tab
        gcTime: 60 * 60 * 1000,
        // Retry 2 gange ved fejl
        retry: 2,
        // Deaktivér re-fetch ved window focus (undgå unødvendig traffic)
        refetchOnWindowFocus: false,
        // Deaktivér re-fetch ved komponent-remount (undgå stutter ved navigation)
        refetchOnMount: false,
      },
      mutations: {
        // Vis fejl ved mutation-fejl
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
