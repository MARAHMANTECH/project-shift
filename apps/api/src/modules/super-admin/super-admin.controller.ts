// Super Admin Controller
// All endpoints REQUIRE SUPER_ADMIN role
// Uses unscoped PrismaService (NOT TenantPrismaService) for cross-tenant access

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Logger,
} from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { SuperAdminService } from "./super-admin.service";
import type {
  CreateTenantDto,
  UpdateTenantDto,
} from "./dto/super-admin.dto";

@Controller("admin")
@Roles("SUPER_ADMIN")
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(private readonly adminService: SuperAdminService) {}

  // ── Tenant Management ──

  @Get("tenants")
  async listTenants(
    @Query("search") search?: string,
    @Query("status") status?: string
  ) {
    return this.adminService.listTenants(search, status);
  }

  @Post("tenants")
  async createTenant(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `SUPER_ADMIN ${user.email} creating tenant: ${dto.name}`
    );
    return this.adminService.createTenant(dto, user.id);
  }

  @Get("tenants/:id")
  async getTenantDetails(@Param("id") id: string) {
    return this.adminService.getTenantDetails(id);
  }

  @Patch("tenants/:id")
  async updateTenant(
    @Param("id") id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `SUPER_ADMIN ${user.email} updating tenant: ${id}`
    );
    return this.adminService.updateTenant(id, dto, user.id);
  }

  @Delete("tenants/:id")
  async deleteTenant(
    @Param("id") id: string,
    @Query("dryRun") dryRun: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const isDryRun = dryRun !== "false";
    this.logger.log(
      `SUPER_ADMIN ${user.email} deleting tenant: ${id} (dryRun: ${isDryRun})`
    );
    return this.adminService.deleteTenant(id, isDryRun, user.id);
  }

  // ── Integration Overview ──

  @Get("integrations")
  async listAllIntegrations() {
    return this.adminService.listAllIntegrations();
  }

  // ── ESG Cross-Tenant ──

  @Get("esg/overview")
  async getEsgOverview() {
    return this.adminService.getEsgCrossTenantOverview();
  }

  // ── Impersonation ──

  @Post("tenants/:id/impersonate")
  async startImpersonation(
    @Param("id") orgId: string,
    @Body("reason") reason: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.warn(
      `SUPER_ADMIN ${user.email} impersonating org: ${orgId}`
    );
    return this.adminService.startImpersonation(
      user.id,
      orgId,
      reason
    );
  }
}
