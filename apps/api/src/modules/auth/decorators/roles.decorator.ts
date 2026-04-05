// @Roles() decorator - marks handler with required roles
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/**
 * Require specific roles for a route handler.
 * Works with RolesGuard which checks role hierarchy.
 *
 * @example
 * @Roles('ORG_ADMIN')
 * @Post('settings')
 * updateOrgSettings() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
