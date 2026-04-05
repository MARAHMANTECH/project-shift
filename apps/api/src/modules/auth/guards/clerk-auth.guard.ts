// Production Clerk Auth Guard
// Verifies JWT from Clerk, extracts user/org context.
// Falls back to DevAuthGuard in development if no Clerk key is configured.

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { envConfig } from "../../../common/config/env.validation";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedUser } from "../types/auth.types";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly clerkClient;
  private readonly secretKey: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {
    this.secretKey = envConfig.CLERK_SECRET_KEY;
    if (this.secretKey) {
      this.clerkClient = createClerkClient({ secretKey: this.secretKey });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth for @Public() decorated endpoints
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // If no Clerk key configured, skip (DevAuthGuard handles dev mode)
    if (!this.clerkClient || !this.secretKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader?.startsWith("Bearer ")) {
      const sessionToken = request.cookies?.__session;
      if (!sessionToken) {
        throw new UnauthorizedException(
          "Manglende autorisering. Log ind for at fortsætte."
        );
      }
      return this.verifyAndSetUser(request, sessionToken);
    }

    const token = authHeader.split(" ")[1];
    return this.verifyAndSetUser(request, token);
  }

  private async verifyAndSetUser(
    request: Record<string, unknown>,
    token: string
  ): Promise<boolean> {
    try {
      const verifiedToken = await verifyToken(token, {
        secretKey: this.secretKey!,
      });

      const clerkUserId = verifiedToken.sub;
      const clerkOrgId = verifiedToken.org_id as string | undefined;

      // Find or create user via JIT provisioning
      const user = await this.findOrProvisionUser(clerkUserId, clerkOrgId);

      if (!user) {
        throw new UnauthorizedException(
          "Bruger ikke fundet. Kontakt administrator."
        );
      }

      // Set auth context on request
      request.user = user;
      request.tenantId = user.organizationId;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `JWT verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw new UnauthorizedException(
        "Ugyldig session. Log ind igen."
      );
    }
  }

  private async findOrProvisionUser(
    clerkUserId: string,
    clerkOrgId?: string
  ): Promise<AuthenticatedUser | null> {
    // Look up user by Clerk external auth ID
    const dbUser = await this.prisma.user.findUnique({
      where: { externalAuthId: clerkUserId },
    });

    if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
      // Check if role is SUPER_ADMIN via Clerk metadata
      const role = await this.resolveRole(clerkUserId, dbUser.role);

      return {
        id: dbUser.id,
        externalAuthId: dbUser.externalAuthId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        organizationId: dbUser.organizationId,
        role,
      };
    }

    // JIT Provisioning: User exists in Clerk but not in DB
    if (!dbUser) {
      return this.jitProvision(clerkUserId, clerkOrgId);
    }

    // User exists but is inactive or deleted
    return null;
  }

  private async jitProvision(
    clerkUserId: string,
    clerkOrgId?: string
  ): Promise<AuthenticatedUser | null> {
    try {
      const clerkUser = await this.clerkClient!.users.getUser(clerkUserId);

      if (!clerkUser.emailAddresses?.[0]) {
        this.logger.warn(
          `JIT provision failed: No email for Clerk user ${clerkUserId}`
        );
        return null;
      }

      const email = clerkUser.emailAddresses[0].emailAddress;
      const firstName = clerkUser.firstName ?? "Ukendt";
      const lastName = clerkUser.lastName ?? "";

      // Find organization by Clerk org ID or email domain
      let orgId = clerkOrgId
        ? await this.findOrgByClerkId(clerkOrgId)
        : null;

      if (!orgId) {
        const domain = email.split("@")[1];
        const emailDomain = await this.prisma.emailDomain.findFirst({
          where: { domain, isVerified: true },
        });
        orgId = emailDomain?.organizationId ?? null;
      }

      if (!orgId) {
        this.logger.warn(
          `JIT provision failed: No org found for ${email}`
        );
        return null;
      }

      // Resolve role from Clerk publicMetadata
      const publicMetadata = clerkUser.publicMetadata as
        | Record<string, unknown>
        | undefined;
      const metadataRole = publicMetadata?.role as string | undefined;
      const role = (
        metadataRole === "SUPER_ADMIN"
          ? "SUPER_ADMIN"
          : metadataRole === "ORG_ADMIN"
            ? "ORG_ADMIN"
            : "MEMBER"
      ) as AuthenticatedUser["role"];

      const newUser = await this.prisma.user.create({
        data: {
          externalAuthId: clerkUserId,
          email,
          firstName,
          lastName,
          avatarUrl: clerkUser.imageUrl ?? null,
          role,
          organizationId: orgId,
        },
      });

      this.logger.log(
        `JIT provisioned user: ${email} (org: ${orgId}, role: ${role})`
      );

      return {
        id: newUser.id,
        externalAuthId: newUser.externalAuthId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        organizationId: newUser.organizationId,
        role,
      };
    } catch (error) {
      this.logger.error(
        `JIT provision error: ${error instanceof Error ? error.message : "Unknown"}`
      );
      return null;
    }
  }

  private async resolveRole(
    clerkUserId: string,
    currentDbRole: string
  ): Promise<AuthenticatedUser["role"]> {
    try {
      const clerkUser = await this.clerkClient!.users.getUser(clerkUserId);
      const publicMetadata = clerkUser.publicMetadata as
        | Record<string, unknown>
        | undefined;
      const metadataRole = publicMetadata?.role as string | undefined;

      if (metadataRole === "SUPER_ADMIN") return "SUPER_ADMIN";
      if (metadataRole === "ORG_ADMIN") return "ORG_ADMIN";
    } catch {
      // Fall back to DB role if Clerk API fails
    }
    return currentDbRole as AuthenticatedUser["role"];
  }

  private async findOrgByClerkId(
    clerkOrgId: string
  ): Promise<string | null> {
    // Map Clerk org ID to internal org ID
    const org = await this.prisma.organization.findFirst({
      where: { slug: clerkOrgId, deletedAt: null },
    });
    return org?.id ?? null;
  }
}
