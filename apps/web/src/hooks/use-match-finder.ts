"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface MatchResult {
  id: string;
  driverId: string;
  driverFirstName: string;
  driverLastName: string;
  departurePointId: string;
  departurePointName: string;
  arrivalPointId: string;
  arrivalPointName: string;
  departureTime: string;
  availableSeats: number;
  distanceMeters: number;
  timeDifferenceMinutes: number;
  matchScore: number;
  notes: string | null;
}

interface MatchFinderParams {
  latitude: number;
  longitude: number;
  departureTime: string;
  radiusMeters?: number;
  timeWindowMinutes?: number;
}

export function useMatchFinder(params: MatchFinderParams | null) {
  const qs = params
    ? new URLSearchParams({
        latitude: String(params.latitude),
        longitude: String(params.longitude),
        departureTime: params.departureTime,
        ...(params.radiusMeters && { radiusMeters: String(params.radiusMeters) }),
        ...(params.timeWindowMinutes && {
          timeWindowMinutes: String(params.timeWindowMinutes),
        }),
      }).toString()
    : "";

  return useQuery({
    queryKey: ["rides", "match", params] as const,
    queryFn: () => apiClient.get<MatchResult[]>(`/rides/match?${qs}`),
    enabled: !!params,
    staleTime: 15_000,
  });
}
