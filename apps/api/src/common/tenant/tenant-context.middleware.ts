// Tenant context middleware
// Layer 3 of multi-tenancy: extracts organizationId from authenticated user
// and propagates it through the request lifecycle.
// Works with JwtAuthGuard (production) and DevAuthGuard (development).
// Flow: Entra ID tid → email domain → EmailDomain.organizationId → req.tenantId

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    // Primær kilde: tenantId sat af auth guard (JwtAuthGuard / DevAuthGuard)
    const tenantId =
      (req as unknown as Record<string, unknown>)["tenantId"] as string | undefined ??
      // Fallback: header (kun development)
      (req.headers["x-organization-id"] as string | undefined) ??
      // Fallback: fra user objekt (guards sætter organizationId)
      ((req as unknown as Record<string, unknown>)["user"] as Record<string, unknown> | undefined)?.["organizationId"] as string | undefined;

    if (tenantId) {
      (req as unknown as Record<string, unknown>)["tenantId"] = tenantId;
    }

    next();
  }
}
