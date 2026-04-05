"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface EsgSummary {
  totalTrips: number;
  totalDistanceKm: number;
  totalCo2SavedKg: number;
  averageCo2PerTrip: number;
}

export function useEsgSummary(periodStart?: string, periodEnd?: string) {
  const params = new URLSearchParams();
  if (periodStart) params.set("periodStart", periodStart);
  if (periodEnd) params.set("periodEnd", periodEnd);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: ["esg", "summary", periodStart, periodEnd] as const,
    queryFn: () => apiClient.get<EsgSummary>(`/esg/summary${qs}`),
    staleTime: 60_000, // 1 minute
  });
}
