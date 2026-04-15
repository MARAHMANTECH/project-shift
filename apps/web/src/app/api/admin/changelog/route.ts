// API Route: Changelog admin CRUD (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? undefined;
    const isPublished = searchParams.get("isPublished");
    const search = searchParams.get("search") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (isPublished === "true") where.isPublished = true;
    if (isPublished === "false") where.isPublished = false;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.changelog.findMany({
        where,
        orderBy: [{ versionBuild: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.changelog.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("Failed to fetch changelogs:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.versionBuild || !body.type || !body.title || !body.description) {
      return NextResponse.json({ error: "Alle felter er påkrævede" }, { status: 400 });
    }

    const entry = await prisma.changelog.create({
      data: {
        versionBuild: body.versionBuild,
        type: body.type,
        title: body.title,
        description: body.description,
        isPublished: body.isPublished ?? false,
        publishedAt: body.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create changelog:", error);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500 });
  }
}
