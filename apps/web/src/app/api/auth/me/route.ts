// API Route: Hent den aktuelle brugers rolle fra databasen
// Bruges af frontend til at bestemme navigation (SUPER_ADMIN link etc.)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ role: null });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    return NextResponse.json({ role: user?.role ?? null });
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return NextResponse.json({ role: null });
  }
}
