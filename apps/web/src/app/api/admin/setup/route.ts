// Engangs-setup: Opgraderer den første bruger til SUPER_ADMIN
// SLET DENNE FIL EFTER BRUG — den er kun til initial setup
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    // Opgradér den aktuelle bruger til SUPER_ADMIN
    const user = await prisma.user.updateMany({
      where: { email },
      data: { role: "SUPER_ADMIN" },
    });

    if (user.count === 0) {
      return NextResponse.json({ error: "Bruger ikke fundet i databasen" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${email} er nu SUPER_ADMIN. Slet denne fil efter brug!`,
    });
  } catch (error) {
    console.error("Setup failed:", error);
    return NextResponse.json({ error: "Fejl ved setup" }, { status: 500 });
  }
}
