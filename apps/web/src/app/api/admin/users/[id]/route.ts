// API Route: Bruger detaljer + rolleændring + statusopdatering + flytning
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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
    }

    const recentActivity = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        createdAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({ ...user, recentActivity });
  } catch (error) {
    console.error("Failed to fetch user:", error);
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
    const { action } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true, organizationId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
    }

    // Hent admin bruger til audit
    const adminUser = adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
      : null;
    const adminUserId = adminUser?.id ?? "system";

    // ── Rolleændring ──
    if (action === "changeRole" && body.role) {
      // Forhindre nedgradering af sidste SUPER_ADMIN
      if (user.role === "SUPER_ADMIN" && body.role !== "SUPER_ADMIN") {
        const superAdminCount = await prisma.user.count({
          where: { role: "SUPER_ADMIN", isActive: true, deletedAt: null },
        });
        if (superAdminCount <= 1) {
          return NextResponse.json(
            { error: "Kan ikke nedgradere den eneste aktive Super Admin." },
            { status: 403 }
          );
        }
      }

      const previousRole = user.role;
      const updated = await prisma.user.update({
        where: { id },
        data: { role: body.role },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
      });

      await prisma.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: adminUserId,
          action: "USER_ROLE_CHANGED",
          entity: "User",
          entityId: id,
          metadata: { targetEmail: user.email, previousRole, newRole: body.role },
        },
      });

      return NextResponse.json(updated);
    }

    // ── Status toggle ──
    if (action === "toggleStatus") {
      if (user.role === "SUPER_ADMIN" && user.isActive) {
        const activeSupers = await prisma.user.count({
          where: { role: "SUPER_ADMIN", isActive: true, deletedAt: null },
        });
        if (activeSupers <= 1) {
          return NextResponse.json(
            { error: "Kan ikke deaktivere den eneste aktive Super Admin." },
            { status: 403 }
          );
        }
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
      });

      await prisma.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: adminUserId,
          action: updated.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
          entity: "User",
          entityId: id,
          metadata: { targetEmail: user.email },
        },
      });

      return NextResponse.json(updated);
    }

    // ── Flyt til organisation ──
    if (action === "moveOrganization" && body.organizationId) {
      const targetOrg = await prisma.organization.findUnique({
        where: { id: body.organizationId },
        select: { id: true, name: true },
      });

      if (!targetOrg) {
        return NextResponse.json({ error: "Målorganisation ikke fundet" }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { organizationId: body.organizationId },
        include: { organization: { select: { id: true, name: true, slug: true } } },
      });

      await prisma.auditLog.create({
        data: {
          organizationId: body.organizationId,
          userId: adminUserId,
          action: "USER_MOVED",
          entity: "User",
          entityId: id,
          metadata: {
            targetEmail: user.email,
            fromOrganizationId: user.organizationId,
            toOrganizationId: body.organizationId,
          },
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Ugyldig handling" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
