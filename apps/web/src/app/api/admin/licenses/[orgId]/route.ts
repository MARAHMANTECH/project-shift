// API Route: License update for specific org (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const { authorized, email: adminEmail } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { orgId } = await params;
    const body = await request.json();

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json({ error: "Organisation ikke fundet" }, { status: 404 });
    }

    const adminUser = adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
      : null;

    const license = await prisma.organizationLicense.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        tier: body.tier ?? "TRIAL",
        maxUsers: body.maxUsers ?? 50,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        notes: body.notes ?? null,
      },
      update: {
        ...(body.tier && { tier: body.tier }),
        ...(body.maxUsers && { maxUsers: body.maxUsers }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: adminUser?.id ?? "system",
        action: "LICENSE_UPDATED",
        entity: "OrganizationLicense",
        entityId: license.id,
        metadata: body,
      },
    });

    return NextResponse.json(license);
  } catch (error) {
    console.error("Failed to update license:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
