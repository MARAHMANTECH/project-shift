// Super Admin Service
// Cross-tenant operations using UNSCOPED PrismaService
// Per .rules/03-multi-tenancy-security.md: Only SUPER_ADMIN may use unscoped client

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { CreateTenantDto, UpdateTenantDto } from "./dto/super-admin.dto";

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Tenant Management ──

  async listTenants(search?: string, status?: string) {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "active") {
      where.deletedAt = null;
    } else if (status === "deleted") {
      where.deletedAt = { not: null };
    }

    const tenants = await this.prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            users: { where: { deletedAt: null } },
            rides: true,
          },
        },
        license: true,
        modules: { where: { isEnabled: true } },
        ssoConnections: { where: { status: "ACTIVE" } },
        integrations: { where: { status: "ACTIVE" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logoUrl,
      createdAt: t.createdAt,
      deletedAt: t.deletedAt,
      userCount: t._count.users,
      rideCount: t._count.rides,
      license: t.license
        ? {
            tier: t.license.tier,
            maxUsers: t.license.maxUsers,
            expiresAt: t.license.expiresAt,
          }
        : null,
      enabledModules: t.modules.map((m) => m.module),
      activeSsoConnections: t.ssoConnections.length,
      activeIntegrations: t.integrations.length,
    }));
  }

  async createTenant(dto: CreateTenantDto, adminUserId: string) {
    // Check slug uniqueness
    const existing = await this.prisma.organization.findFirst({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Organisationen med slug '${dto.slug}' eksisterer allerede.`
      );
    }

    // Create organization + license + modules + email domains in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
        },
      });

      await tx.organizationLicense.create({
        data: {
          organizationId: org.id,
          tier: dto.licenseTier,
          maxUsers: dto.maxUsers,
        },
      });

      if (dto.emailDomains.length > 0) {
        await tx.emailDomain.createMany({
          data: dto.emailDomains.map((domain) => ({
            domain,
            organizationId: org.id,
            isVerified: true,
          })),
          skipDuplicates: true,
        });
      }

      if (dto.enabledModules.length > 0) {
        await tx.orgModule.createMany({
          data: dto.enabledModules.map((mod) => ({
            organizationId: org.id,
            module: mod,
            isEnabled: true,
          })),
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: adminUserId,
          action: "TENANT_CREATED",
          entity: "Organization",
          entityId: org.id,
          metadata: { slug: dto.slug, tier: dto.licenseTier },
        },
      });

      return org;
    });

    this.logger.log(`Tenant created: ${result.slug} (${result.id})`);
    return result;
  }

  async getTenantDetails(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 100, // Limit in-memory users for performance, stats come from DB
        },
        license: true,
        modules: true,
        emailDomains: true,
        ssoConnections: true,
        integrations: true,
        _count: {
          select: {
            users: { where: { deletedAt: null } },
            rides: true,
            events: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organisation ${orgId} ikke fundet.`);
    }

    // Get active users count separately as Prisma _count doesn't support multiple filtered counts for same relation easily
    const activeUsersCount = await this.prisma.user.count({
      where: {
        organizationId: orgId,
        isActive: true,
        deletedAt: null,
      },
    });

    return {
      ...org,
      stats: {
        totalUsers: org._count.users,
        activeUsers: activeUsersCount,
        totalRides: org._count.rides,
        totalEvents: org._count.events,
        totalAuditEntries: org._count.auditLogs,
      },
    };
  }

  async updateTenant(
    orgId: string,
    dto: UpdateTenantDto,
    adminUserId: string
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException(`Organisation ${orgId} ikke fundet.`);
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.name || dto.logoUrl !== undefined) {
        await tx.organization.update({
          where: { id: orgId },
          data: {
            ...(dto.name && { name: dto.name }),
            ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
          },
        });
      }

      if (dto.licenseTier || dto.maxUsers) {
        await tx.organizationLicense.upsert({
          where: { organizationId: orgId },
          create: {
            organizationId: orgId,
            tier: dto.licenseTier ?? "TRIAL",
            maxUsers: dto.maxUsers ?? 50,
          },
          update: {
            ...(dto.licenseTier && { tier: dto.licenseTier }),
            ...(dto.maxUsers && { maxUsers: dto.maxUsers }),
          },
        });
      }

      if (dto.enabledModules) {
        // Disable all, then enable selected
        await tx.orgModule.updateMany({
          where: { organizationId: orgId },
          data: { isEnabled: false },
        });

        for (const mod of dto.enabledModules) {
          await tx.orgModule.upsert({
            where: {
              organizationId_module: {
                organizationId: orgId,
                module: mod,
              },
            },
            create: {
              organizationId: orgId,
              module: mod,
              isEnabled: true,
            },
            update: { isEnabled: true },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId: adminUserId,
          action: "TENANT_UPDATED",
          entity: "Organization",
          entityId: orgId,
          metadata: JSON.parse(JSON.stringify(dto)),
        },
      });
    });

    return this.getTenantDetails(orgId);
  }

  async deleteTenant(
    orgId: string,
    dryRun: boolean,
    adminUserId: string
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: { select: { users: true, rides: true, events: true } },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organisation ${orgId} ikke fundet.`);
    }

    const impact = {
      organization: org.name,
      usersAffected: org._count.users,
      ridesAffected: org._count.rides,
      eventsAffected: org._count.events,
      dryRun,
    };

    if (dryRun) {
      return { message: "Dry-run: Ingen ændringer foretaget.", ...impact };
    }

    // Soft-delete per governance rules
    await this.prisma.organization.update({
      where: { id: orgId },
      data: { deletedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: adminUserId,
        action: "TENANT_SOFT_DELETED",
        entity: "Organization",
        entityId: orgId,
        metadata: impact,
      },
    });

    this.logger.warn(`Tenant soft-deleted: ${org.slug} (${orgId})`);
    return { message: "Organisation soft-deleted.", ...impact };
  }

  // ── Integration Overview ──

  async listAllIntegrations() {
    return this.prisma.integrationConfiguration.findMany({
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // ── ESG Cross-Tenant ──

  async getEsgCrossTenantOverview() {
    const orgs = await this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const results = await Promise.all(
      orgs.map(async (org) => {
        const aggregate = await this.prisma.esgTripLog.aggregate({
          where: { organizationId: org.id },
          _sum: { co2SavedKg: true, distanceKm: true },
          _count: true,
        });

        return {
          organization: org,
          totalCo2SavedKg: aggregate._sum.co2SavedKg ?? 0,
          totalDistanceKm: aggregate._sum.distanceKm ?? 0,
          totalTrips: aggregate._count,
        };
      })
    );

    const totals = results.reduce(
      (acc, r) => ({
        totalCo2SavedKg: acc.totalCo2SavedKg + r.totalCo2SavedKg,
        totalDistanceKm: acc.totalDistanceKm + r.totalDistanceKm,
        totalTrips: acc.totalTrips + r.totalTrips,
      }),
      { totalCo2SavedKg: 0, totalDistanceKm: 0, totalTrips: 0 }
    );

    return { organizations: results, totals };
  }

  // ── Impersonation ──

  async startImpersonation(
    adminUserId: string,
    orgId: string,
    reason: string
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException(`Organisation ${orgId} ikke fundet.`);
    }

    const log = await this.prisma.impersonationLog.create({
      data: {
        adminUserId,
        targetUserId: orgId,
        reason,
      },
    });

    this.logger.warn(
      `Impersonation started: admin ${adminUserId} → org ${orgId}`
    );

    return {
      impersonationId: log.id,
      organizationId: orgId,
      organizationName: org.name,
      startedAt: log.startedAt,
    };
  }
}
