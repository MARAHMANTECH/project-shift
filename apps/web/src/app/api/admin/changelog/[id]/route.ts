// API Route: Changelog entry CRUD (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const entry = await prisma.changelog.findUnique({ where: { id } });
    if (!entry) {
      return NextResponse.json({ error: "Changelog ikke fundet" }, { status: 404 });
    }

    // Toggle publish
    if (body.action === "togglePublish") {
      const newPublished = !entry.isPublished;
      const updated = await prisma.changelog.update({
        where: { id },
        data: {
          isPublished: newPublished,
          publishedAt: newPublished ? new Date() : null,
        },
      });
      return NextResponse.json(updated);
    }

    // Standard update
    const data: Record<string, unknown> = {};
    if (body.versionBuild) data.versionBuild = body.versionBuild;
    if (body.type) data.type = body.type;
    if (body.title) data.title = body.title;
    if (body.description) data.description = body.description;
    if (body.isPublished !== undefined) {
      data.isPublished = body.isPublished;
      if (body.isPublished && !entry.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const updated = await prisma.changelog.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update changelog:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { id } = await params;

    const entry = await prisma.changelog.findUnique({ where: { id } });
    if (!entry) {
      return NextResponse.json({ error: "Changelog ikke fundet" }, { status: 404 });
    }

    await prisma.changelog.delete({ where: { id } });
    return NextResponse.json({ message: "Changelog slettet" });
  } catch (error) {
    console.error("Failed to delete changelog:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
