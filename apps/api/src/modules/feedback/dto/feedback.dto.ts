// Feedback DTOs — Zod-validerede schemas med danske fejlbeskeder
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, named exports

import { z } from "zod";

export const createFeedbackSchema = z.object({
  type: z.enum(["BUG", "FEATURE", "IMPROVEMENT"], {
    required_error: "Type er påkrævet.",
    invalid_type_error: "Ugyldig type. Vælg Fejl, Feature eller Forbedring.",
  }),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional()
    .default("MEDIUM"),
  title: z
    .string({ required_error: "Titel er påkrævet." })
    .min(3, "Titel skal være mindst 3 tegn.")
    .max(200, "Titel må maks. være 200 tegn."),
  content: z
    .string({ required_error: "Beskrivelse er påkrævet." })
    .min(10, "Beskrivelse skal være mindst 10 tegn."),
});

export const updateFeedbackSchema = z.object({
  status: z
    .enum(["NEW", "UNDER_REVIEW", "PLANNED", "IN_BUILD", "DONE"])
    .optional(),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),
  isGlobal: z.boolean().optional(),
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
});

export const resolveFeedbackSchema = z.object({
  createChangelog: z.boolean().optional().default(false),
  changelogTitle: z.string().min(3).max(200).optional(),
  changelogDescription: z.string().min(10).optional(),
  changelogType: z.enum(["FEATURE", "FIX", "IMPROVEMENT"]).optional(),
  changelogBuild: z.number().int().positive().optional(),
});

export const feedbackFilterSchema = z.object({
  status: z
    .enum(["NEW", "UNDER_REVIEW", "PLANNED", "IN_BUILD", "DONE"])
    .optional(),
  type: z
    .enum(["BUG", "FEATURE", "IMPROVEMENT"])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type CreateFeedbackDto = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackDto = z.infer<typeof updateFeedbackSchema>;
export type ResolveFeedbackDto = z.infer<typeof resolveFeedbackSchema>;
export type FeedbackFilterDto = z.infer<typeof feedbackFilterSchema>;
