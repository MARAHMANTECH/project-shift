// Canteen Plugin — skeleton for kantineordning integration
// Syncs menu data from external canteen providers

import { Injectable, Logger } from "@nestjs/common";
import type {
  IntegrationPlugin,
  PluginMetadata,
  IntegrationHealthStatus,
  WebhookResult,
} from "../../interfaces/integration-plugin.interface";

@Injectable()
export class CanteenPlugin implements IntegrationPlugin {
  private readonly logger = new Logger(CanteenPlugin.name);

  readonly metadata: PluginMetadata = {
    type: "CANTEEN_MENU_SYNC",
    displayName: "Kantineordning",
    description:
      "Synkronisér daglige kantinemenuer med din organisations Project SHIFT-app. Medarbejdere kan se og bestille frokost direkte.",
    configSchema: {
      apiUrl: { type: "string", required: true, label: "Kantine API URL" },
      apiKey: { type: "string", required: true, label: "API-nøgle", secret: true },
      syncInterval: { type: "number", required: false, label: "Sync-interval (minutter)", default: 60 },
    },
  };

  async onActivate(config: Record<string, unknown>): Promise<void> {
    this.logger.log(`Canteen plugin activated with config: ${JSON.stringify(Object.keys(config))}`);
    // TODO: Validate API connection, fetch initial menu
  }

  async onDeactivate(): Promise<void> {
    this.logger.log("Canteen plugin deactivated");
    // TODO: Clean up scheduled sync jobs
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    this.logger.log("Canteen webhook received");
    // TODO: Process menu update from canteen provider
    return {
      success: true,
      message: "Kantinemenu opdateret",
      processedItems: 0,
    };
  }

  async getStatus(): Promise<IntegrationHealthStatus> {
    return {
      status: "INACTIVE",
      lastSyncAt: null,
      errorMessage: null,
      details: { version: "1.0.0" },
    };
  }
}
