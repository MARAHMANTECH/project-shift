// Super Admin Module
// Provides cross-tenant management endpoints for SUPER_ADMIN users
// Uses UNSCOPED PrismaService — NOT TenantPrismaService

import { Module } from "@nestjs/common";
import { SuperAdminController } from "./super-admin.controller";
import { SuperAdminService } from "./super-admin.service";

@Module({
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
