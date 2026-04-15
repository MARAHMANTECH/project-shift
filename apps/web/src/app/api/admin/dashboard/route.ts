// API Route: Dashboard stats (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const [
      totalOrgs,
      activeOrgs,
      totalUsers,
      activeUsers,
      totalRides,
      completedRides,
      totalEvents,
      totalCo2,
      licenseTiers,
      roleDistribution,
      recentAudit,
      feedbackStats,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      prisma.ride.count(),
      prisma.ride.count({ where: { status: "COMPLETED" } }),
      prisma.event.count(),
      prisma.esgTripLog.aggregate({ _sum: { co2SavedKg: true } }),
      prisma.organizationLicense.groupBy({ by: ["tier"], _count: true }),
      prisma.user.groupBy({ by: ["role"], where: { deletedAt: null }, _count: true }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          organization: { select: { name: true } },
        },
      }),
      prisma.feedback.groupBy({ by: ["status"], _count: true }),
    ]);

    return NextResponse.json({
      organizations: { total: totalOrgs, active: activeOrgs },
      users: { total: totalUsers, active: activeUsers },
      rides: { total: totalRides, completed: completedRides },
      events: { total: totalEvents },
      esg: { totalCo2SavedKg: totalCo2._sum.co2SavedKg ?? 0 },
      licenseTiers: licenseTiers.map((lt) => ({ tier: lt.tier, count: lt._count })),
      roleDistribution: roleDistribution.map((rd) => ({ role: rd.role, count: rd._count })),
      feedbackStats: feedbackStats.map((fs) => ({ status: fs.status, count: fs._count })),
      recentAudit,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
