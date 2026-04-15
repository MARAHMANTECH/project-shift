// Hjælpefunktion: Verificerer at den aktuelle bruger har SUPER_ADMIN rolle
// Bruges af alle /api/admin/* routes som guard

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface AdminCheckResult {
  authorized: boolean;
  email: string | null;
  role: string | null;
}

export async function requireSuperAdmin(): Promise<AdminCheckResult> {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return { authorized: false, email: null, role: null };
    }

    // Slå rollen op direkte i databasen (session har ikke rollen da Prisma ikke kan køre i Edge)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    return {
      authorized: user?.role === "SUPER_ADMIN",
      email,
      role: user?.role ?? null,
    };
  } catch (error) {
    console.error("Admin auth check failed:", error);
    return { authorized: false, email: null, role: null };
  }
}
