"use client";

// React Query hooks for Feedback API
// Per .rules/04-ui-ux.md: ALDRIG useEffect + fetch — brug React Query
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, named exports

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Types matching API responses
export interface FeedbackUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface FeedbackEntry {
  id: string;
  organizationId: string;
  userId: string;
  type: "BUG" | "FEATURE" | "IMPROVEMENT";
  status: "NEW" | "UNDER_REVIEW" | "PLANNED" | "IN_BUILD" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  content: string;
  isGlobal: boolean;
  resolvedAt: string | null;
  changelogId: string | null;
  createdAt: string;
  updatedAt: string;
  user: FeedbackUser;
}

export interface FeedbackStats {
  active: number;
  bugs: number;
  features: number;
  improvements: number;
  inBuild: number;
}

interface FeedbackListResponse {
  data: FeedbackEntry[];
  total: number;
  page: number;
  limit: number;
}

interface CreateFeedbackInput {
  type: "BUG" | "FEATURE" | "IMPROVEMENT";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  content: string;
}

interface UpdateFeedbackInput {
  id: string;
  status?: "NEW" | "UNDER_REVIEW" | "PLANNED" | "IN_BUILD" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

// Query keys
const feedbackKeys = {
  all: ["feedback"] as const,
  lists: () => [...feedbackKeys.all, "list"] as const,
  list: (filter?: { status?: string; type?: string; search?: string }) =>
    [...feedbackKeys.lists(), filter] as const,
  stats: () => [...feedbackKeys.all, "stats"] as const,
  details: () => [...feedbackKeys.all, "detail"] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
};

/** Hent alle indmeldinger for brugerens organisation */
export function useFeedbacks(filter?: {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
}): ReturnType<typeof useQuery<FeedbackListResponse>> {
  return useQuery({
    queryKey: feedbackKeys.list(filter),
    queryFn: (): Promise<FeedbackListResponse> => {
      const params = new URLSearchParams();
      if (filter?.status) params.set("status", filter.status);
      if (filter?.type) params.set("type", filter.type);
      if (filter?.search) params.set("search", filter.search);
      if (filter?.page) params.set("page", String(filter.page));
      const qs = params.toString();
      return apiClient.get<FeedbackListResponse>(
        `/feedback${qs ? `?${qs}` : ""}`
      );
    },
    staleTime: 30_000, // feedback ændres oftere — 30s cache
  });
}

/** Hent aggregerede feedback-statistikker */
export function useFeedbackStats(): ReturnType<
  typeof useQuery<FeedbackStats>
> {
  return useQuery({
    queryKey: feedbackKeys.stats(),
    queryFn: (): Promise<FeedbackStats> =>
      apiClient.get<FeedbackStats>("/feedback/stats"),
    staleTime: 30_000,
  });
}

/** Opret ny indmelding */
export function useCreateFeedback(): ReturnType<
  typeof useMutation<FeedbackEntry, Error, CreateFeedbackInput>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFeedbackInput): Promise<FeedbackEntry> =>
      apiClient.post<FeedbackEntry>("/feedback", input),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
    },
  });
}

/** Opdater feedback-status (Admin) */
export function useUpdateFeedbackStatus(): ReturnType<
  typeof useMutation<FeedbackEntry, Error, UpdateFeedbackInput>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateFeedbackInput): Promise<FeedbackEntry> =>
      apiClient.patch<FeedbackEntry>(`/feedback/${id}`, body),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
    },
  });
}

/** Slet indmelding */
export function useDeleteFeedback(): ReturnType<
  typeof useMutation<{ message: string }, Error, string>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<{ message: string }> =>
      apiClient.delete<{ message: string }>(`/feedback/${id}`),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
    },
  });
}
