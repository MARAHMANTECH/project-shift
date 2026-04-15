// Super Admin DTOs — Zod schemas for request validation
// All endpoints require SUPER_ADMIN role
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, named exports

import { z } from "zod";

// ── Tenant Management ──────────────────────────────────────────────

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

// ── User Management ─────────────────────────────────────────────────

export const userFilterSchema = z.object({
  role: z.enum(["MEMBER", "ORG_ADMIN", "SUPER_ADMIN"]).optional(),
  organizationId: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type UserFilterDto = z.infer<typeof userFilterSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(["MEMBER", "ORG_ADMIN", "SUPER_ADMIN"], {
    required_error: "Rolle er påkrævet.",
    invalid_type_error: "Ugyldig rolle.",
  }),
});

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "Status er påkrævet.",
  }),
});

export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;

export const moveUserSchema = z.object({
  organizationId: z.string({
    required_error: "Organisation-ID er påkrævet.",
  }).min(1, "Organisation-ID er påkrævet."),
});

export type MoveUserDto = z.infer<typeof moveUserSchema>;

// ── Audit Log ───────────────────────────────────────────────────────

export const auditLogFilterSchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type AuditLogFilterDto = z.infer<typeof auditLogFilterSchema>;

// ── License Management ──────────────────────────────────────────────

export const updateLicenseSchema = z.object({
  tier: z.enum(["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  maxUsers: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type UpdateLicenseDto = z.infer<typeof updateLicenseSchema>;

// ── Feedback Admin ──────────────────────────────────────────────────

export const adminFeedbackFilterSchema = z.object({
  status: z.enum(["NEW", "UNDER_REVIEW", "PLANNED", "IN_BUILD", "DONE"]).optional(),
  type: z.enum(["BUG", "FEATURE", "IMPROVEMENT"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  organizationId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type AdminFeedbackFilterDto = z.infer<typeof adminFeedbackFilterSchema>;

export const adminUpdateFeedbackSchema = z.object({
  status: z.enum(["NEW", "UNDER_REVIEW", "PLANNED", "IN_BUILD", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  isGlobal: z.boolean().optional(),
});

export type AdminUpdateFeedbackDto = z.infer<typeof adminUpdateFeedbackSchema>;

export const adminResolveFeedbackSchema = z.object({
  createChangelog: z.boolean().optional().default(false),
  changelogTitle: z.string().min(3).max(200).optional(),
  changelogDescription: z.string().min(10).optional(),
  changelogType: z.enum(["FEATURE", "FIX", "IMPROVEMENT"]).optional(),
  changelogBuild: z.number().int().positive().optional(),
});

export type AdminResolveFeedbackDto = z.infer<typeof adminResolveFeedbackSchema>;

// ── Changelog Admin ─────────────────────────────────────────────────

export const adminChangelogFilterSchema = z.object({
  type: z.enum(["FEATURE", "FIX", "IMPROVEMENT"]).optional(),
  isPublished: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type AdminChangelogFilterDto = z.infer<typeof adminChangelogFilterSchema>;

export const adminCreateChangelogSchema = z.object({
  versionBuild: z.number().int().positive({ message: "Build-nummer skal være positivt." }),
  type: z.enum(["FEATURE", "FIX", "IMPROVEMENT"], {
    required_error: "Type er påkrævet.",
  }),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  isPublished: z.boolean().optional().default(false),
});

export type AdminCreateChangelogDto = z.infer<typeof adminCreateChangelogSchema>;

export const adminUpdateChangelogSchema = adminCreateChangelogSchema.partial();

export type AdminUpdateChangelogDto = z.infer<typeof adminUpdateChangelogSchema>;

// ── SSO Management ──────────────────────────────────────────────────

export const updateSsoStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "DISABLED", "ERROR"], {
    required_error: "Status er påkrævet.",
  }),
});

export type UpdateSsoStatusDto = z.infer<typeof updateSsoStatusSchema>;
