// API Route: Hent aggregeret ESG data (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    // Aggreger ESG-data på tværs af alle organisationer
    const aggregation = await prisma.esgTripLog.aggregate({
      _sum: {
        co2SavedKg: true,
        distanceKm: true,
        passengerCount: true,
      },
      _count: true,
    });

    // Top organisationer efter CO2
    const topOrgs = await prisma.esgTripLog.groupBy({
      by: ["organizationId"],
      _sum: { co2SavedKg: true },
      _count: true,
      orderBy: { _sum: { co2SavedKg: "desc" } },
      take: 10,
    });

    // Hent organisationsnavne
    const orgIds = topOrgs.map((o) => o.organizationId);
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    });

    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

    return NextResponse.json({
      totalCo2SavedKg: aggregation._sum.co2SavedKg ?? 0,
      totalTrips: aggregation._count,
      totalDistanceKm: aggregation._sum.distanceKm ?? 0,
      totalPassengers: aggregation._sum.passengerCount ?? 0,
      topOrganizations: topOrgs.map((o) => ({
        name: orgMap.get(o.organizationId) ?? "Ukendt",
        co2SavedKg: o._sum.co2SavedKg ?? 0,
        tripCount: o._count,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch ESG data", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
