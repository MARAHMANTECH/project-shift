// Organization domain types

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  enabledModules: ModuleConfig[];
}

export interface ModuleConfig {
  module: ModuleType;
  isEnabled: boolean;
  config: Record<string, unknown> | null;
}

export type ModuleType =
  | "RIDESHARING"
  | "ESG_DASHBOARD"
  | "COMMUNITY"
  | "PAYMENTS";

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logoUrl?: string;
  emailDomains: string[];
}
