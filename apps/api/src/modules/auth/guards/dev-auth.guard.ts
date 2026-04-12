// Development-only auth guard
// Auto-injects a test user from seed data in development mode.
// In production, this guard blocks all requests — use JwtAuthGuard instead.
// Respects @Public() decorator for webhook endpoints.

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { envConfig } from "../../../common/config/env.validation";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedUser } from "../types/auth.types";

@Injectable()
export class DevAuthGuard implements CanActivate {
  // Cache the dev user to avoid repeated DB lookups
  private cachedDevUser: AuthenticatedUser | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth for @Public() decorated endpoints (webhooks, health checks)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (envConfig.NODE_ENV === "production") {
      throw new UnauthorizedException(
        "DevAuthGuard cannot be used in production. Configure JwtAuthGuard with Entra ID."
      );
    }

    const request = context.switchToHttp().getRequest();

    // Allow override via header for testing different users
    const overrideEmail = request.headers["x-dev-user-email"] as
      | string
      | undefined;

    const user = overrideEmail
      ? await this.findUserByEmail(overrideEmail)
      : await this.getDefaultDevUser();

    if (!user) {
      throw new UnauthorizedException(
        "Dev user not found. Run `npm run db:seed` first."
      );
    }

    // Set auth context on request
    request.user = user;
    request.tenantId = user.organizationId;

    return true;
  }

  private async getDefaultDevUser(): Promise<AuthenticatedUser | null> {
    if (this.cachedDevUser) {
      return this.cachedDevUser;
    }

    const dbUser = await this.prisma.user.findFirst({
      where: { role: "ORG_ADMIN", isActive: true, deletedAt: null },
    });

    if (!dbUser) {
      return null;
    }

    this.cachedDevUser = this.mapToAuthUser(dbUser);
    return this.cachedDevUser;
  }

  private async findUserByEmail(
    email: string
  ): Promise<AuthenticatedUser | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
      return null;
    }

    return this.mapToAuthUser(dbUser);
  }

  private mapToAuthUser(dbUser: {
    id: string;
    externalAuthId: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    role: string;
  }): AuthenticatedUser {
    return {
      id: dbUser.id,
      externalAuthId: dbUser.externalAuthId,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      organizationId: dbUser.organizationId,
      role: dbUser.role as AuthenticatedUser["role"],
    };
  }
}
