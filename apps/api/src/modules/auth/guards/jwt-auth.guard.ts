// JWT Auth Guard — NextAuth.js JWT-verificering via jose
// JIT Provisioning bevaret: Email-domain → Organization mapping

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jose from "jose";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { envConfig } from "../../../common/config/env.validation";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedUser } from "../types/auth.types";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly secret: Uint8Array | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {
    const nextauthSecret = envConfig.NEXTAUTH_SECRET;
    this.secret = nextauthSecret
      ? new TextEncoder().encode(nextauthSecret)
      : null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth for @Public() decorated endpoints
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // If no secret configured, skip (DevAuthGuard handles dev mode)
    if (!this.secret) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Try Authorization header first
    const authHeader = request.headers.authorization as string | undefined;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Try session cookie as fallback
    if (!token) {
      const sessionToken =
        request.cookies?.["authjs.session-token"] ??
        request.cookies?.["__Secure-authjs.session-token"];

      if (!sessionToken) {
        throw new UnauthorizedException(
          "Manglende autorisering. Log ind for at fortsætte."
        );
      }
      token = sessionToken;
    }

    return this.verifyAndSetUser(request, token);
  }

  private async verifyAndSetUser(
    request: Record<string, unknown>,
    token: string
  ): Promise<boolean> {
    try {
      // Verificer JWT med NextAuth's secret
      const { payload } = await jose.jwtVerify(token, this.secret!);

      const email = payload.email as string | undefined;
      const name = payload.name as string | undefined;
      const azureAdOid = (payload.azureAdOid as string) ?? payload.sub;
      const picture = payload.picture as string | undefined;

      if (!email) {
        throw new UnauthorizedException(
          "JWT mangler email. Kontakt administrator."
        );
      }

      // Find or create user via JIT provisioning
      const user = await this.findOrProvisionUser(
        azureAdOid ?? email,
        email,
        name,
        picture
      );

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
      throw new UnauthorizedException("Ugyldig session. Log ind igen.");
    }
  }

  private async findOrProvisionUser(
    externalId: string,
    email: string,
    name?: string,
    avatarUrl?: string
  ): Promise<AuthenticatedUser | null> {
    // Look up user by external auth ID or email
    let dbUser = await this.prisma.user.findUnique({
      where: { externalAuthId: externalId },
    });

    // Fallback: Find via email
    if (!dbUser) {
      dbUser = await this.prisma.user.findFirst({
        where: { email, deletedAt: null },
      });
    }

    if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
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

    // JIT Provisioning: User exists in Azure AD but not in DB
    if (!dbUser) {
      return this.jitProvision(externalId, email, name, avatarUrl);
    }

    // User exists but is inactive or deleted
    return null;
  }

  private async jitProvision(
    externalId: string,
    email: string,
    name?: string,
    avatarUrl?: string
  ): Promise<AuthenticatedUser | null> {
    try {
      // Find organization by email domain
      const domain = email.split("@")[1];
      const emailDomain = await this.prisma.emailDomain.findFirst({
        where: { domain, isVerified: true },
      });

      if (!emailDomain) {
        this.logger.warn(
          `JIT provision failed: No verified domain for ${domain}, user ${email} not provisioned`
        );
        return null;
      }

      const nameParts = (name ?? "Ukendt").split(" ");
      const firstName = nameParts[0] ?? "Ukendt";
      const lastName = nameParts.slice(1).join(" ") ?? "";

      const newUser = await this.prisma.user.create({
        data: {
          externalAuthId: externalId,
          email,
          firstName,
          lastName,
          avatarUrl: avatarUrl ?? null,
          role: "MEMBER",
          organizationId: emailDomain.organizationId,
        },
      });

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          organizationId: emailDomain.organizationId,
          userId: newUser.id,
          action: "USER_JIT_PROVISIONED",
          entity: "User",
          entityId: newUser.id,
        },
      });

      this.logger.log(
        `JIT provisioned user: ${email} (org: ${emailDomain.organizationId})`
      );

      return {
        id: newUser.id,
        externalAuthId: newUser.externalAuthId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        organizationId: newUser.organizationId,
        role: "MEMBER",
      };
    } catch (error) {
      this.logger.error(
        `JIT provision error: ${error instanceof Error ? error.message : "Unknown"}`
      );
      return null;
    }
  }
}
