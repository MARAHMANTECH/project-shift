// API Route: Tenant details (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
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
        },
        license: true,
        modules: true,
        emailDomains: true,
        ssoConnections: true,
        integrations: true,
        _count: { select: { rides: true, events: true, auditLogs: true, feedbacks: true } },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organisation ikke fundet" }, { status: 404 });
    }

    return NextResponse.json({
      ...org,
      stats: {
        totalUsers: org.users.length,
        activeUsers: org.users.filter((u) => u.isActive).length,
        totalRides: org._count.rides,
        totalEvents: org._count.events,
        totalAuditEntries: org._count.auditLogs,
        totalFeedback: org._count.feedbacks,
      },
    });
  } catch (error) {
    console.error("Failed to fetch tenant:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { authorized, email: adminEmail } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return NextResponse.json({ error: "Organisation ikke fundet" }, { status: 404 });
    }

    const adminUser = adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
      : null;
    const adminUserId = adminUser?.id ?? "system";

    await prisma.$transaction(async (tx) => {
      // Opdatér basis-felter
      if (body.name || body.logoUrl !== undefined) {
        await tx.organization.update({
          where: { id },
          data: {
            ...(body.name && { name: body.name }),
            ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
          },
        });
      }

      // Opdatér license
      if (body.licenseTier || body.maxUsers) {
        await tx.organizationLicense.upsert({
          where: { organizationId: id },
          create: {
            organizationId: id,
            tier: body.licenseTier ?? "TRIAL",
            maxUsers: body.maxUsers ?? 50,
          },
          update: {
            ...(body.licenseTier && { tier: body.licenseTier }),
            ...(body.maxUsers && { maxUsers: body.maxUsers }),
          },
        });
      }

      // Opdatér moduler
      if (body.enabledModules) {
        await tx.orgModule.updateMany({
          where: { organizationId: id },
          data: { isEnabled: false },
        });

        for (const mod of body.enabledModules) {
          await tx.orgModule.upsert({
            where: { organizationId_module: { organizationId: id, module: mod } },
            create: { organizationId: id, module: mod, isEnabled: true },
            update: { isEnabled: true },
          });
        }
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          organizationId: id,
          userId: adminUserId,
          action: "TENANT_UPDATED",
          entity: "Organization",
          entityId: id,
          metadata: body,
        },
      });
    });

    // Returner opdaterede data
    const updated = await prisma.organization.findUnique({
      where: { id },
      include: {
        license: true,
        modules: true,
        emailDomains: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update tenant:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { authorized, email: adminEmail } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") !== "false";

    const org = await prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true, rides: true, events: true } } },
    });

    if (!org) {
      return NextResponse.json({ error: "Organisation ikke fundet" }, { status: 404 });
    }

    const impact = {
      organization: org.name,
      usersAffected: org._count.users,
      ridesAffected: org._count.rides,
      eventsAffected: org._count.events,
      dryRun,
    };

    if (dryRun) {
      return NextResponse.json({ message: "Dry-run: Ingen ændringer foretaget.", ...impact });
    }

    const adminUser = adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
      : null;

    await prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: id,
        userId: adminUser?.id ?? "system",
        action: "TENANT_SOFT_DELETED",
        entity: "Organization",
        entityId: id,
        metadata: impact,
      },
    });

    return NextResponse.json({ message: "Organisation soft-deleted.", ...impact });
  } catch (error) {
    console.error("Failed to delete tenant:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
