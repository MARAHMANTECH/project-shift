// API Route: Hent alle tenants (SUPER_ADMIN only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(): Promise<NextResponse> {
  try {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Ikke autoriseret" }, { status: 403 });
    }

    const tenants = await prisma.organization.findMany({
      include: {
        emailDomains: { select: { domain: true } },
        license: { select: { tier: true, maxUsers: true, expiresAt: true } },
        _count: { select: { users: true, rides: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Failed to fetch tenants", error);
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
    const { name, slug, emailDomains, entraTenantId, entraGroupId } = body;

    // Understøtter både enkelt domæne (string) og flere domæner (string[])
    const domains: string[] = Array.isArray(emailDomains)
      ? emailDomains.filter(Boolean)
      : emailDomains ? [emailDomains] : [];

    if (!name || !slug || domains.length === 0) {
      return NextResponse.json({ error: "Navn, slug og mindst ét email-domæne er påkrævet" }, { status: 400 });
    }

    const tenant = await prisma.organization.create({
      data: {
        name,
        slug,
        entraTenantId: entraTenantId || null,
        entraGroupId: entraGroupId || null,
        emailDomains: {
          create: domains.map((domain: string) => ({
            domain: domain.toLowerCase().trim(),
            isVerified: true,
          })),
        },
      },
      include: {
        emailDomains: true,
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error("Failed to create tenant", error);
    return NextResponse.json({ error: "Kunne ikke oprette organisation" }, { status: 500 });
  }
}
