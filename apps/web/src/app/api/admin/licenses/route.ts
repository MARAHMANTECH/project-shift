// API Route: License management (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const orgs = await prisma.organization.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        license: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });

    const data = orgs.map((org) => ({
      organizationId: org.id,
      organizationName: org.name,
      organizationSlug: org.slug,
      license: org.license,
      currentUsers: org._count.users,
      usagePercent: org.license
        ? Math.round((org._count.users / org.license.maxUsers) * 100)
        : 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch licenses:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
