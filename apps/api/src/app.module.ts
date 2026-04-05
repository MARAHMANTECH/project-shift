// Root application module
import { Module } from "@nestjs/common";
import { PrismaModule } from "./common/prisma/prisma.module";
import { ClerkModule } from "./common/clerk/clerk.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { RidesModule } from "./modules/rides/rides.module";
import { MeetingPointsModule } from "./modules/meeting-points/meeting-points.module";
import { EsgModule } from "./modules/esg/esg.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SuperAdminModule } from "./modules/super-admin/super-admin.module";
import { IntegrationHubModule } from "./modules/integration-hub/integration-hub.module";

@Module({
  imports: [
    PrismaModule,
    ClerkModule,
    AuditModule,
    AuthModule,
    OrganizationsModule,
    MeetingPointsModule,
    RidesModule,
    EsgModule,
    SuperAdminModule,
    IntegrationHubModule,
  ],
})
export class AppModule {}
