// Intern API: Henter brugerens rolle og tenant-konfiguration baseret på email
// Bruges af auth.ts JWT callback for at undgå Prisma i Edge Runtime
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  // Simpelt sikkerhedstjek — denne route må kun kaldes internt
  const internalKey = request.headers.get("x-internal-key");
  if (internalKey !== (process.env.AUTH_SECRET ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        role: true,
        organization: {
          select: {
            entraGroupId: true,
            entraTenantId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ role: null, entraGroupId: null });
    }

    return NextResponse.json({
      role: user.role,
      entraGroupId: user.organization.entraGroupId,
      entraTenantId: user.organization.entraTenantId,
    });
  } catch (error) {
    console.error("Failed to fetch user config:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
