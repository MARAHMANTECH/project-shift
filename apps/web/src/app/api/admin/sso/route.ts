// API Route: SSO connections (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const connections = await prisma.ssoConnection.findMany({
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Failed to fetch SSO connections:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
