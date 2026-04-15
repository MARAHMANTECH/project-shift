// API Route: Feedback detail actions (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

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

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { id: true, title: true, type: true, organizationId: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback ikke fundet" }, { status: 404 });
    }

    const adminUser = adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
      : null;
    const adminUserId = adminUser?.id ?? "system";

    // ── Resolve (marker som udført) ──
    if (body.action === "resolve") {
      const updatedFeedback = await prisma.feedback.update({
        where: { id },
        data: { status: "DONE", resolvedAt: new Date() },
      });

      let changelog = null;
      if (body.createChangelog && body.changelogBuild) {
        changelog = await prisma.changelog.create({
          data: {
            versionBuild: body.changelogBuild,
            type: body.changelogType ?? feedback.type,
            title: body.changelogTitle ?? feedback.title,
            description: body.changelogDescription ?? `Indmelding løst: ${feedback.title}`,
            isPublished: true,
            publishedAt: new Date(),
          },
        });

        await prisma.feedback.update({
          where: { id },
          data: { changelogId: changelog.id },
        });
      }

      await prisma.auditLog.create({
        data: {
          organizationId: feedback.organizationId,
          userId: adminUserId,
          action: "FEEDBACK_RESOLVED",
          entity: "Feedback",
          entityId: id,
          metadata: { title: feedback.title, createdChangelog: !!changelog },
        },
      });

      return NextResponse.json({ feedback: updatedFeedback, changelog });
    }

    // ── Standard opdatering (status, prioritet, isGlobal) ──
    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.isGlobal !== undefined) updateData.isGlobal = body.isGlobal;

    const updated = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: feedback.organizationId,
        userId: adminUserId,
        action: "FEEDBACK_UPDATED",
        entity: "Feedback",
        entityId: id,
        metadata: JSON.parse(JSON.stringify({ title: feedback.title, changes: updateData })),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
