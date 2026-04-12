// Authenticated user interface
// Maps to NextAuth JWT claims + Entra ID profile data

export interface AuthenticatedUser {
  /** Internal database user ID */
  id: string;
  /** External auth ID (Entra ID oid or dev placeholder) */
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
