// Integration Hub Controller
// REST endpoints for plugin management and webhook ingress

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Logger,
} from "@nestjs/common";
import type { IntegrationType } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { IntegrationHubService } from "./integration-hub.service";

@Controller("integrations")
export class IntegrationHubController {
  private readonly logger = new Logger(IntegrationHubController.name);

  constructor(private readonly hubService: IntegrationHubService) {}

  /** List all available integration plugins */
  @Get()
  listPlugins() {
    return this.hubService.listAvailablePlugins();
  }

  /** Get plugin details + current config for caller's org */
  @Get(":type")
  async getPluginDetails(
    @Param("type") type: IntegrationType,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.hubService.getPluginDetails(type, user.organizationId);
  }

  /** Configure a plugin (ORG_ADMIN or SUPER_ADMIN only) */
  @Post(":type/configure")
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async configurePlugin(
    @Param("type") type: IntegrationType,
    @Body() body: { config: Record<string, unknown> },
    @CurrentUser() user: AuthenticatedUser
  ) {
    this.logger.log(
      `${user.role} ${user.email} configuring ${type} for org ${user.organizationId}`
    );
    return this.hubService.configurePlugin(
      type,
      user.organizationId,
      body.config
    );
  }

  /** Activate a plugin */
  @Post(":type/activate")
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async activatePlugin(
    @Param("type") type: IntegrationType,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.hubService.activatePlugin(type, user.organizationId);
  }

  /** Deactivate a plugin */
  @Post(":type/deactivate")
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async deactivatePlugin(
    @Param("type") type: IntegrationType,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.hubService.deactivatePlugin(type, user.organizationId);
  }

  /** Generic webhook endpoint for external services */
  @Public()
  @Post("webhooks/:type/:orgId")
  async handleIntegrationWebhook(
    @Param("type") type: IntegrationType,
    @Param("orgId") orgId: string,
    @Body() payload: unknown
  ) {
    return this.hubService.handleWebhook(type, orgId, payload);
  }
}
