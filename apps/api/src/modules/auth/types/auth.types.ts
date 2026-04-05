// Authenticated user interface
// Matches Clerk JWT claims structure for future integration

export interface AuthenticatedUser {
  /** Internal database user ID */
  id: string;
  /** Clerk external auth ID (or dev placeholder) */
  externalAuthId: string;
  /** User email */
  email: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** Organization ID (tenant context) */
  organizationId: string;
  /** User role */
  role: "MEMBER" | "ORG_ADMIN" | "SUPER_ADMIN";
}

/**
 * Extended Express Request with auth context.
 * Used by guards and decorators to propagate user info.
 */
export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  tenantId: string;
}
