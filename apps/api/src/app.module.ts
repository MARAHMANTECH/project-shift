// Root application module
import { Module } from "@nestjs/common";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { RidesModule } from "./modules/rides/rides.module";
import { MeetingPointsModule } from "./modules/meeting-points/meeting-points.module";
import { EsgModule } from "./modules/esg/esg.module";
import { AuditModule } from "./modules/audit/audit.module";
import { HealthModule } from "./modules/health/health.module";
import { SuperAdminModule } from "./modules/super-admin/super-admin.module";
import { IntegrationHubModule } from "./modules/integration-hub/integration-hub.module";
import { ChangelogModule } from "./modules/changelog/changelog.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    OrganizationsModule,
    MeetingPointsModule,
    RidesModule,
    EsgModule,
    HealthModule,
    SuperAdminModule,
    IntegrationHubModule,
    ChangelogModule,
    FeedbackModule,
  ],
})
export class AppModule {}
