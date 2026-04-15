// Engangs-script: Opgradér en bruger til SUPER_ADMIN i Railway databasen
// Brug: DATABASE_URL="..." node scripts/promote-admin.mjs admin@1r8dkc.onmicrosoft.com

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];

if (!email) {
  console.error("❌ Brug: DATABASE_URL=\"...\" node scripts/promote-admin.mjs <email>");
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`⚠️  Bruger ${email} findes ikke. Tilgængelige brugere:`);
      const users = await prisma.user.findMany({ select: { email: true, role: true } });
      users.forEach((u) => console.log(`   ${u.email} (${u.role})`));
      return;
    }

    console.log(`📋 Nuværende rolle: ${user.role}`);

    if (user.role === "SUPER_ADMIN") {
      console.log("✅ Brugeren er allerede SUPER_ADMIN!");
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" },
    });

    console.log(`✅ ${email} er nu SUPER_ADMIN!`);
  } catch (error) {
    console.error("❌ Fejl:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
