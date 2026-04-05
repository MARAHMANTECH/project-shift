// Rides DTO - Zod schemas for request validation
// All external inputs validated at runtime per .rules/02-tech-standards.md

import { z } from "zod";

export const createRideSchema = z.object({
  departurePointId: z.string().min(1, "Afgangspunkt er påkrævet."),
  arrivalPointId: z.string().min(1, "Ankomstpunkt er påkrævet."),
  departureTime: z
    .string()
    .datetime({ message: "Afgangstid skal være et gyldigt ISO 8601 tidspunkt." }),
  availableSeats: z
    .number()
    .int()
    .min(1, "Der skal være mindst 1 ledig plads.")
    .max(8, "Maksimalt 8 pladser tilladt."),
  notes: z.string().max(500).optional(),
});

export type CreateRideDto = z.infer<typeof createRideSchema>;

export const updateRideSchema = z.object({
  departureTime: z
    .string()
    .datetime({ message: "Afgangstid skal være et gyldigt ISO 8601 tidspunkt." })
    .optional(),
  availableSeats: z
    .number()
    .int()
    .min(1, "Der skal være mindst 1 ledig plads.")
    .max(8, "Maksimalt 8 pladser tilladt.")
    .optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export type UpdateRideDto = z.infer<typeof updateRideSchema>;

export const matchQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  departureTime: z.string().datetime({
    message: "Ønsket afgangstid skal være et gyldigt ISO 8601 tidspunkt.",
  }),
  radiusMeters: z.coerce.number().int().min(500).max(10000).default(2000),
  timeWindowMinutes: z.coerce.number().int().min(5).max(60).default(15),
});

export type MatchQueryDto = z.infer<typeof matchQuerySchema>;
