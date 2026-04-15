// API Route: Hent alle integrationer (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const integrations = await prisma.integrationConfiguration.findMany({
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error("Failed to fetch integrations", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
