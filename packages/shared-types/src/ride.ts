// Ride domain types

export type RideStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PassengerStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PointType = "TRAIN_STATION" | "BUS_STOP" | "PARKING_LOT" | "COMPANY_HUB" | "OTHER";

export interface MeetingPointDto {
  id: string;
  name: string;
  address: string;
  pointType: PointType;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface RideDto {
  id: string;
  driverId: string;
  driverName: string;
  departurePoint: MeetingPointDto;
  arrivalPoint: MeetingPointDto;
  departureTime: string;
  availableSeats: number;
  status: RideStatus;
  distanceKm: number | null;
  passengers: RidePassengerDto[];
  notes: string | null;
}

export interface RidePassengerDto {
  id: string;
  userId: string;
  userName: string;
  status: PassengerStatus;
  bookedAt: string;
}

export interface CreateRideInput {
  departurePointId: string;
  arrivalPointId: string;
  departureTime: string;
  availableSeats: number;
  notes?: string;
}

export interface RideMatchResult {
  ride: RideDto;
  distanceMeters: number;
  timeDifferenceMinutes: number;
  matchScore: number;
}
