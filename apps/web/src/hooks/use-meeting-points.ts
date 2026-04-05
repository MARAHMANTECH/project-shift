"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface MeetingPoint {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  pointType: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
}

export function useMeetingPoints() {
  return useQuery({
    queryKey: ["meetingPoints"] as const,
    queryFn: () => apiClient.get<MeetingPoint[]>("/meeting-points"),
    staleTime: 5 * 60_000, // 5 minutes — rarely changes
  });
}
