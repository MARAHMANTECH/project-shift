// Tenant-aware Prisma client
// Implements Layer 4 of multi-tenancy: ORM-level filtering via $extends
//
// NEVER use the raw PrismaService directly in tenant context.
// Only SUPER_ADMIN operations may bypass tenant filtering.

import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "./prisma.service";

interface RequestWithTenant {
  tenantId?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: RequestWithTenant
  ) {}

  /**
   * Returns a Prisma client extended with automatic organization_id filtering.
   * All queries through this client are scoped to the current tenant.
   */
  getClient() {
    const organizationId = this.request.tenantId;

    if (!organizationId) {
      throw new Error(
        "[TENANT] No tenant context found. Ensure TenantContextMiddleware is applied."
      );
    }

    return this.prisma.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async findUnique({ args, query }) {
            return query(args);
          },
          async create({ args, query }) {
            const data = args.data as Record<string, unknown>;
            data["organizationId"] = organizationId;
            return query(args);
          },
          async updateMany({ args, query }) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
          async deleteMany({ args, query }) {
            args.where = { ...args.where, organizationId };
            return query(args);
          },
        },
      },
    });
  }
}
