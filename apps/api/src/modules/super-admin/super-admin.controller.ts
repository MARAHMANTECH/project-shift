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
  UserFilterDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  MoveUserDto,
  AuditLogFilterDto,
  UpdateLicenseDto,
  AdminFeedbackFilterDto,
  AdminUpdateFeedbackDto,
  AdminResolveFeedbackDto,
  AdminChangelogFilterDto,
  AdminCreateChangelogDto,
  AdminUpdateChangelogDto,
  UpdateSsoStatusDto,
} from "./dto/super-admin.dto";

@Controller("admin")
@Roles("SUPER_ADMIN")
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(private readonly adminService: SuperAdminService) {}

  // ══════════════════════════════════════════════════════════════════
  // TENANT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ══════════════════════════════════════════════════════════════════

  @Get("users")
  async listUsers(@Query() filter: UserFilterDto) {
    return this.adminService.listUsers(filter);
  }

  @Get("users/:id")
  async getUserDetails(@Param("id") id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch("users/:id/role")
  async updateUserRole(
    @Param("id") id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `SUPER_ADMIN ${user.email} changing role for user: ${id}`
    );
    return this.adminService.updateUserRole(id, dto, user.id);
  }

  @Patch("users/:id/status")
  async updateUserStatus(
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `SUPER_ADMIN ${user.email} updating status for user: ${id}`
    );
    return this.adminService.updateUserStatus(id, dto, user.id);
  }

  @Patch("users/:id/organization")
  async moveUser(
    @Param("id") id: string,
    @Body() dto: MoveUserDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `SUPER_ADMIN ${user.email} moving user: ${id}`
    );
    return this.adminService.moveUser(id, dto, user.id);
  }

  // ══════════════════════════════════════════════════════════════════
  // AUDIT LOG
  // ══════════════════════════════════════════════════════════════════

  @Get("audit-logs")
  async listAuditLogs(@Query() filter: AuditLogFilterDto) {
    return this.adminService.listAuditLogs(filter);
  }

  @Get("impersonation-logs")
  async listImpersonationLogs() {
    return this.adminService.listImpersonationLogs();
  }

  // ══════════════════════════════════════════════════════════════════
  // DASHBOARD & STATS
  // ══════════════════════════════════════════════════════════════════

  @Get("dashboard/stats")
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ══════════════════════════════════════════════════════════════════
  // LICENSE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════

  @Get("licenses")
  async listLicenses() {
    return this.adminService.listLicenses();
  }

  @Patch("licenses/:orgId")
  async updateLicense(
    @Param("orgId") orgId: string,
    @Body() dto: UpdateLicenseDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `SUPER_ADMIN ${user.email} updating license for org: ${orgId}`
    );
    return this.adminService.updateLicense(orgId, dto, user.id);
  }

  // ══════════════════════════════════════════════════════════════════
  // FEEDBACK TRIAGE (global)
  // ══════════════════════════════════════════════════════════════════

  @Get("feedback")
  async listAllFeedback(@Query() filter: AdminFeedbackFilterDto) {
    return this.adminService.listAllFeedback(filter);
  }

  @Patch("feedback/:id")
  async updateFeedback(
    @Param("id") id: string,
    @Body() dto: AdminUpdateFeedbackDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.adminUpdateFeedback(id, dto, user.id);
  }

  @Patch("feedback/:id/resolve")
  async resolveFeedback(
    @Param("id") id: string,
    @Body() dto: AdminResolveFeedbackDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.adminResolveFeedback(id, dto, user.id);
  }

  // ══════════════════════════════════════════════════════════════════
  // CHANGELOG ADMIN
  // ══════════════════════════════════════════════════════════════════

  @Get("changelog")
  async listChangelogs(@Query() filter: AdminChangelogFilterDto) {
    return this.adminService.listAllChangelogs(filter);
  }

  @Post("changelog")
  async createChangelog(@Body() dto: AdminCreateChangelogDto) {
    return this.adminService.adminCreateChangelog(dto);
  }

  @Patch("changelog/:id")
  async updateChangelog(
    @Param("id") id: string,
    @Body() dto: AdminUpdateChangelogDto
  ) {
    return this.adminService.adminUpdateChangelog(id, dto);
  }

  @Delete("changelog/:id")
  async deleteChangelog(@Param("id") id: string) {
    return this.adminService.adminDeleteChangelog(id);
  }

  @Patch("changelog/:id/publish")
  async togglePublish(@Param("id") id: string) {
    return this.adminService.toggleChangelogPublish(id);
  }

  // ══════════════════════════════════════════════════════════════════
  // SSO MANAGEMENT
  // ══════════════════════════════════════════════════════════════════

  @Get("sso")
  async listSsoConnections() {
    return this.adminService.listAllSsoConnections();
  }

  @Patch("sso/:id")
  async updateSsoStatus(
    @Param("id") id: string,
    @Body() dto: UpdateSsoStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateSsoStatus(id, dto, user.id);
  }

  // ══════════════════════════════════════════════════════════════════
  // INTEGRATION OVERVIEW (existing)
  // ══════════════════════════════════════════════════════════════════

  @Get("integrations")
  async listAllIntegrations() {
    return this.adminService.listAllIntegrations();
  }

  // ══════════════════════════════════════════════════════════════════
  // ESG CROSS-TENANT (existing)
  // ══════════════════════════════════════════════════════════════════

  @Get("esg/overview")
  async getEsgOverview() {
    return this.adminService.getEsgCrossTenantOverview();
  }

  // ══════════════════════════════════════════════════════════════════
  // IMPERSONATION (existing)
  // ══════════════════════════════════════════════════════════════════

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
