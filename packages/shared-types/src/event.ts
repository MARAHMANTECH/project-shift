// Event/Community domain types

export type EventType = "SOCIAL" | "SPORTS" | "WORKSHOP" | "NETWORKING" | "OTHER";
export type AttendeeStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED" | "ATTENDED";

export interface EventDto {
  id: string;
  title: string;
  description: string | null;
  eventType: EventType;
  startTime: string;
  endTime: string;
  location: string | null;
  maxAttendees: number | null;
  isPublic: boolean;
  attendeeCount: number;
  createdAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  location?: string;
  maxAttendees?: number;
  isPublic?: boolean;
}

export interface EventAttendeeDto {
  id: string;
  userId: string;
  userName: string;
  status: AttendeeStatus;
  registeredAt: string;
}
