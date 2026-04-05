// prisma/seed.ts
// Seed data for Project SHIFT development environment
// Run with: npx prisma db seed

import { PrismaClient, ModuleType, PointType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("[SEED] Starting seed process...");

  // ============================================================
  // 1. Create demo organization
  // ============================================================
  const demoOrg = await prisma.organization.upsert({
    where: { slug: "acme-denmark" },
    update: {},
    create: {
      name: "ACME Denmark A/S",
      slug: "acme-denmark",
    },
  });
  console.log(`[SEED] Organization created: ${demoOrg.name} (${demoOrg.id})`);

  // ============================================================
  // 2. Register email domain
  // ============================================================
  await prisma.emailDomain.upsert({
    where: { domain: "acme.dk" },
    update: {},
    create: {
      domain: "acme.dk",
      organizationId: demoOrg.id,
      isVerified: true,
    },
  });
  console.log("[SEED] Email domain registered: acme.dk");

  // ============================================================
  // 3. Enable modules
  // ============================================================
  const modules: ModuleType[] = [
    ModuleType.RIDESHARING,
    ModuleType.ESG_DASHBOARD,
    ModuleType.COMMUNITY,
  ];

  for (const mod of modules) {
    await prisma.orgModule.upsert({
      where: {
        organizationId_module: {
          organizationId: demoOrg.id,
          module: mod,
        },
      },
      update: {},
      create: {
        organizationId: demoOrg.id,
        module: mod,
        isEnabled: true,
      },
    });
  }
  console.log("[SEED] Modules enabled: RIDESHARING, ESG_DASHBOARD, COMMUNITY");

  // ============================================================
  // 4. Create demo users
  // ============================================================
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@acme.dk" },
    update: {},
    create: {
      externalAuthId: "clerk_demo_admin_001",
      email: "admin@acme.dk",
      firstName: "Lars",
      lastName: "Hansen",
      role: UserRole.ORG_ADMIN,
      organizationId: demoOrg.id,
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: "sofie@acme.dk" },
    update: {},
    create: {
      externalAuthId: "clerk_demo_driver_001",
      email: "sofie@acme.dk",
      firstName: "Sofie",
      lastName: "Nielsen",
      role: UserRole.MEMBER,
      organizationId: demoOrg.id,
    },
  });

  const passengerUser = await prisma.user.upsert({
    where: { email: "mikkel@acme.dk" },
    update: {},
    create: {
      externalAuthId: "clerk_demo_passenger_001",
      email: "mikkel@acme.dk",
      firstName: "Mikkel",
      lastName: "Andersen",
      role: UserRole.MEMBER,
      organizationId: demoOrg.id,
    },
  });

  console.log(
    `[SEED] Users created: ${adminUser.firstName}, ${driverUser.firstName}, ${passengerUser.firstName}`
  );

  // ============================================================
  // 5. Create meeting points (Privacy-by-Design: public locations only)
  // ============================================================
  const meetingPoints = [
    {
      name: "Koebenhavn H - Hovedindgang",
      address: "Bernstorffsgade 16, 1577 Koebenhavn",
      pointType: PointType.TRAIN_STATION,
      latitude: 55.673,
      longitude: 12.565,
    },
    {
      name: "Noerreport Station",
      address: "Noerrevoldgade 80, 1358 Koebenhavn",
      pointType: PointType.TRAIN_STATION,
      latitude: 55.684,
      longitude: 12.572,
    },
    {
      name: "ACME HQ - Parkeringsplads",
      address: "Lyngby Hovedgade 42, 2800 Lyngby",
      pointType: PointType.COMPANY_HUB,
      latitude: 55.771,
      longitude: 12.504,
    },
    {
      name: "Lyngby Station - Busstop A",
      address: "Lyngby Stationsvej 1, 2800 Lyngby",
      pointType: PointType.BUS_STOP,
      latitude: 55.769,
      longitude: 12.502,
    },
  ];

  for (const mp of meetingPoints) {
    // Idempotent: find eksisterende via navn+org, ellers opret
    const existing = await prisma.meetingPoint.findFirst({
      where: { name: mp.name, organizationId: demoOrg.id },
    });

    if (!existing) {
      await prisma.meetingPoint.create({
        data: {
          organizationId: demoOrg.id,
          name: mp.name,
          address: mp.address,
          pointType: mp.pointType,
          latitude: mp.latitude,
          longitude: mp.longitude,
        },
      });
    }
  }
  console.log(`[SEED] Meeting points created: ${meetingPoints.length}`);

  console.log("[SEED] Seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("[SEED] Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
