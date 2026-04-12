"use client";

// React Query hooks for Changelog API
// Per .rules/04-ui-ux.md: ALDRIG useEffect + fetch — brug React Query
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, named exports

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Types matching API responses
export interface ChangelogEntry {
  id: string;
  organizationId: string | null;
  versionBuild: number;
  type: "FEATURE" | "FIX" | "IMPROVEMENT";
  title: string;
  description: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChangelogStats {
  total: number;
  features: number;
  fixes: number;
  improvements: number;
  latestBuild: number;
}

interface ChangelogListResponse {
  data: ChangelogEntry[];
  total: number;
  page: number;
  limit: number;
}

interface CreateChangelogInput {
  versionBuild: number;
  type: "FEATURE" | "FIX" | "IMPROVEMENT";
  title: string;
  description: string;
  isPublished?: boolean;
}

// Query keys
const changelogKeys = {
  all: ["changelog"] as const,
  lists: () => [...changelogKeys.all, "list"] as const,
  list: (filter?: { type?: string; search?: string }) =>
    [...changelogKeys.lists(), filter] as const,
  stats: () => [...changelogKeys.all, "stats"] as const,
  details: () => [...changelogKeys.all, "detail"] as const,
  detail: (id: string) => [...changelogKeys.details(), id] as const,
};

/** Hent alle publicerede changelogs med optional filter */
export function useChangelogs(filter?: {
  type?: string;
  search?: string;
  page?: number;
}): ReturnType<typeof useQuery<ChangelogListResponse>> {
  return useQuery({
    queryKey: changelogKeys.list(filter),
    queryFn: (): Promise<ChangelogListResponse> => {
      const params = new URLSearchParams();
      if (filter?.type) params.set("type", filter.type);
      if (filter?.search) params.set("search", filter.search);
      if (filter?.page) params.set("page", String(filter.page));
      const qs = params.toString();
      return apiClient.get<ChangelogListResponse>(
        `/changelog${qs ? `?${qs}` : ""}`
      );
    },
    staleTime: 60_000, // changelogs ændres sjældent — 60s cache
  });
}

/** Hent aggregerede changelog-statistikker */
export function useChangelogStats(): ReturnType<
  typeof useQuery<ChangelogStats>
> {
  return useQuery({
    queryKey: changelogKeys.stats(),
    queryFn: (): Promise<ChangelogStats> =>
      apiClient.get<ChangelogStats>("/changelog/stats"),
    staleTime: 60_000,
  });
}

/** Opret ny changelog entry (Admin) */
export function useCreateChangelog(): ReturnType<
  typeof useMutation<ChangelogEntry, Error, CreateChangelogInput>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChangelogInput): Promise<ChangelogEntry> =>
      apiClient.post<ChangelogEntry>("/changelog", input),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: changelogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: changelogKeys.stats() });
    },
  });
}
