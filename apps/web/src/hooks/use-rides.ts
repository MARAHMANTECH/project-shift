"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Types matching API responses
interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface MeetingPointRef {
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

interface Passenger {
  id: string;
  rideId: string;
  userId: string;
  status: string;
  bookedAt: string;
  user: { id: string; firstName: string; lastName: string };
}

export interface Ride {
  id: string;
  organizationId: string;
  driverId: string;
  departurePointId: string;
  arrivalPointId: string;
  departureTime: string;
  availableSeats: number;
  status: string;
  distanceKm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  driver: Driver;
  departurePoint: MeetingPointRef;
  arrivalPoint: MeetingPointRef;
  passengers: Passenger[];
}

interface CreateRideInput {
  departurePointId: string;
  arrivalPointId: string;
  departureTime: string;
  availableSeats: number;
  notes?: string;
}

// Query keys
const rideKeys = {
  all: ["rides"] as const,
  lists: () => [...rideKeys.all, "list"] as const,
  list: (status?: string) => [...rideKeys.lists(), { status }] as const,
  details: () => [...rideKeys.all, "detail"] as const,
  detail: (id: string) => [...rideKeys.details(), id] as const,
};

/** List all rides in user's organization */
export function useRides(status?: string) {
  return useQuery({
    queryKey: rideKeys.list(status),
    queryFn: () => {
      const params = status ? `?status=${status}` : "";
      return apiClient.get<Ride[]>(`/rides${params}`);
    },
    staleTime: 30_000, // 30 seconds
  });
}

/** Get a specific ride by ID */
export function useRide(id: string) {
  return useQuery({
    queryKey: rideKeys.detail(id),
    queryFn: () => apiClient.get<Ride>(`/rides/${id}`),
    staleTime: 15_000,
    enabled: !!id,
  });
}

/** Create a new ride */
export function useCreateRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRideInput) =>
      apiClient.post<Ride>("/rides", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rideKeys.lists() });
    },
  });
}

/** Join a ride as passenger */
export function useJoinRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rideId: string) =>
      apiClient.post<{ id: string }>(`/rides/${rideId}/join`),
    onSuccess: (_data, rideId) => {
      queryClient.invalidateQueries({ queryKey: rideKeys.detail(rideId) });
      queryClient.invalidateQueries({ queryKey: rideKeys.lists() });
    },
  });
}

/** Leave a ride */
export function useLeaveRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rideId: string) =>
      apiClient.delete<{ message: string }>(`/rides/${rideId}/leave`),
    onSuccess: (_data, rideId) => {
      queryClient.invalidateQueries({ queryKey: rideKeys.detail(rideId) });
      queryClient.invalidateQueries({ queryKey: rideKeys.lists() });
    },
  });
}
