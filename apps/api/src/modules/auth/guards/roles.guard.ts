// Roles guard - checks if the authenticated user has the required role
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../types/auth.types";

/** Role hierarchy - higher index = more authority */
const ROLE_HIERARCHY: Record<string, number> = {
  MEMBER: 0,
  ORG_ADMIN: 1,
  SUPER_ADMIN: 2,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No roles required = allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      throw new ForbiddenException("Ingen bruger fundet i request context.");
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? -1;
    const hasRole = requiredRoles.some(
      (role) => userLevel >= (ROLE_HIERARCHY[role] ?? Infinity)
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Adgang nægtet. Krævet rolle: ${requiredRoles.join(" eller ")}.`
      );
    }

    return true;
  }
}
