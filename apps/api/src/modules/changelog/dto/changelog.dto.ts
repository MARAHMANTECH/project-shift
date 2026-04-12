// Changelog DTOs — Zod-validerede schemas med danske fejlbeskeder
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, named exports

import { z } from "zod";

export const createChangelogSchema = z.object({
  versionBuild: z
    .number({ required_error: "Build-nummer er påkrævet." })
    .int("Build-nummer skal være et heltal.")
    .positive("Build-nummer skal være positivt."),
  type: z.enum(["FEATURE", "FIX", "IMPROVEMENT"], {
    required_error: "Type er påkrævet.",
    invalid_type_error: "Ugyldig type. Vælg Feature, Fix eller Forbedring.",
  }),
  title: z
    .string({ required_error: "Titel er påkrævet." })
    .min(3, "Titel skal være mindst 3 tegn.")
    .max(200, "Titel må maks. være 200 tegn."),
  description: z
    .string({ required_error: "Beskrivelse er påkrævet." })
    .min(10, "Beskrivelse skal være mindst 10 tegn."),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional(),
});

export const updateChangelogSchema = createChangelogSchema.partial();

export const changelogFilterSchema = z.object({
  type: z
    .enum(["FEATURE", "FIX", "IMPROVEMENT"])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type CreateChangelogDto = z.infer<typeof createChangelogSchema>;
export type UpdateChangelogDto = z.infer<typeof updateChangelogSchema>;
export type ChangelogFilterDto = z.infer<typeof changelogFilterSchema>;
