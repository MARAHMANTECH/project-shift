// Super Admin DTOs — Zod schemas for request validation

import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug må kun indeholde små bogstaver, tal og bindestreger"),
  logoUrl: z.string().url().optional(),
  emailDomains: z
    .array(z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "Ugyldigt domæne"))
    .min(1, "Mindst ét e-mail-domæne kræves"),
  licenseTier: z.enum(["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).default("TRIAL"),
  maxUsers: z.number().int().positive().default(50),
  enabledModules: z
    .array(z.enum(["RIDESHARING", "ESG_DASHBOARD", "COMMUNITY", "PAYMENTS", "CANTEEN", "DELIVERY", "SPORT"]))
    .default(["RIDESHARING", "ESG_DASHBOARD", "COMMUNITY"]),
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logoUrl: z.string().url().optional().nullable(),
  licenseTier: z.enum(["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  maxUsers: z.number().int().positive().optional(),
  enabledModules: z
    .array(z.enum(["RIDESHARING", "ESG_DASHBOARD", "COMMUNITY", "PAYMENTS", "CANTEEN", "DELIVERY", "SPORT"]))
    .optional(),
});

export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
