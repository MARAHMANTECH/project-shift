// Integration Hub Service — Plugin registry + configuration management
// Manages plugin discovery, activation/deactivation, and webhook dispatch

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import type { IntegrationType } from "@prisma/client";
import { TenantPrismaService } from "../../common/prisma/tenant-prisma.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { IntegrationPlugin } from "./interfaces/integration-plugin.interface";
import { CanteenPlugin } from "./plugins/canteen/canteen.plugin";
import { DeliveryPlugin } from "./plugins/delivery/delivery.plugin";
import { SportPlugin } from "./plugins/sport/sport.plugin";

@Injectable()
export class IntegrationHubService {
  private readonly logger = new Logger(IntegrationHubService.name);
  private readonly pluginRegistry: Map<IntegrationType, IntegrationPlugin>;

  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly prisma: PrismaService,
    canteenPlugin: CanteenPlugin,
    deliveryPlugin: DeliveryPlugin,
    sportPlugin: SportPlugin
  ) {
    // Register all available plugins
    this.pluginRegistry = new Map<IntegrationType, IntegrationPlugin>([
      ["CANTEEN_MENU_SYNC", canteenPlugin],
      ["DELIVERY_WOLT", deliveryPlugin],
      ["SPORT_WANNASPORT", sportPlugin],
    ]);
  }

  /**
   * List all available plugins with their metadata
   */
  listAvailablePlugins() {
    return Array.from(this.pluginRegistry.values()).map((p) => p.metadata);
  }

  /**
   * Get a specific plugin by type
   */
  getPlugin(type: IntegrationType): IntegrationPlugin {
    const plugin = this.pluginRegistry.get(type);
    if (!plugin) {
      throw new NotFoundException(`Plugin '${type}' er ikke tilgængelig.`);
    }
    return plugin;
  }

  /**
   * Get plugin details including current configuration for org
   */
  async getPluginDetails(type: IntegrationType, organizationId: string) {
    const plugin = this.getPlugin(type);
    const config = await this.prisma.integrationConfiguration.findUnique({
      where: {
        organizationId_integrationType: {
          organizationId,
          integrationType: type,
        },
      },
    });

    const status = await plugin.getStatus();

    return {
      ...plugin.metadata,
      configuration: config,
      healthStatus: status,
    };
  }

  /**
   * Configure a plugin for an organization
   */
  async configurePlugin(
    type: IntegrationType,
    organizationId: string,
    config: Record<string, unknown>
  ) {
    this.getPlugin(type); // Validate plugin exists

    return this.prisma.integrationConfiguration.upsert({
      where: {
        organizationId_integrationType: {
          organizationId,
          integrationType: type,
        },
      },
      create: {
        organizationId,
        integrationType: type,
        config: config as object,
        status: "INACTIVE",
      },
      update: {
        config: config as object,
      },
    });
  }

  /**
   * Activate a plugin for an organization
   */
  async activatePlugin(type: IntegrationType, organizationId: string) {
    const plugin = this.getPlugin(type);
    const dbConfig = await this.prisma.integrationConfiguration.findUnique({
      where: {
        organizationId_integrationType: {
          organizationId,
          integrationType: type,
        },
      },
    });

    if (!dbConfig) {
      throw new BadRequestException(
        `Plugin '${type}' er ikke konfigureret. Konfigurér først.`
      );
    }

    try {
      await plugin.onActivate(dbConfig.config as Record<string, unknown>);

      await this.prisma.integrationConfiguration.update({
        where: { id: dbConfig.id },
        data: { status: "ACTIVE", errorMessage: null },
      });

      this.logger.log(`Plugin ${type} activated for org ${organizationId}`);
      return { success: true, message: `${type} er nu aktiv.` };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Ukendt fejl";

      await this.prisma.integrationConfiguration.update({
        where: { id: dbConfig.id },
        data: { status: "ERROR", errorMessage: errorMsg },
      });

      throw new BadRequestException(
        `Aktivering af ${type} fejlede: ${errorMsg}`
      );
    }
  }

  /**
   * Deactivate a plugin for an organization
   */
  async deactivatePlugin(type: IntegrationType, organizationId: string) {
    const plugin = this.getPlugin(type);

    await plugin.onDeactivate();

    await this.prisma.integrationConfiguration.update({
      where: {
        organizationId_integrationType: {
          organizationId,
          integrationType: type,
        },
      },
      data: { status: "INACTIVE" },
    });

    this.logger.log(`Plugin ${type} deactivated for org ${organizationId}`);
    return { success: true, message: `${type} er nu deaktiveret.` };
  }

  /**
   * Dispatch a webhook to the appropriate plugin
   */
  async handleWebhook(
    type: IntegrationType,
    organizationId: string,
    payload: unknown
  ) {
    const plugin = this.getPlugin(type);

    // Log webhook event
    await this.prisma.webhookEventLog.create({
      data: {
        organizationId,
        integrationType: type,
        eventType: "incoming_webhook",
        payload: payload as object,
        status: "received",
      },
    });

    try {
      const result = await plugin.handleWebhook(payload);

      // Update event log
      await this.prisma.webhookEventLog.updateMany({
        where: {
          organizationId,
          integrationType: type,
          status: "received",
        },
        data: {
          status: result.success ? "processed" : "error",
          processedAt: new Date(),
          errorMessage: result.success ? null : result.message,
        },
      });

      return result;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Ukendt fejl";
      this.logger.error(`Webhook error for ${type}: ${errorMsg}`);
      throw error;
    }
  }
}
