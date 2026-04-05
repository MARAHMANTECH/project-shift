// Sport Plugin — skeleton for Wannasport integration
// Enables booking of sports facilities through Project SHIFT

import { Injectable, Logger } from "@nestjs/common";
import type {
  IntegrationPlugin,
  PluginMetadata,
  IntegrationHealthStatus,
  WebhookResult,
} from "../../interfaces/integration-plugin.interface";

@Injectable()
export class SportPlugin implements IntegrationPlugin {
  private readonly logger = new Logger(SportPlugin.name);

  readonly metadata: PluginMetadata = {
    type: "SPORT_WANNASPORT",
    displayName: "Wannasport",
    description:
      "Book sportsbaner og faciliteter via Wannasport direkte i Project SHIFT. Perfekt til firmasport og teambuilding.",
    configSchema: {
      wannasportApiKey: { type: "string", required: true, label: "Wannasport API-nøgle", secret: true },
      locationId: { type: "string", required: true, label: "Lokation ID" },
    },
  };

  async onActivate(config: Record<string, unknown>): Promise<void> {
    this.logger.log(`Sport plugin activated: ${JSON.stringify(Object.keys(config))}`);
  }

  async onDeactivate(): Promise<void> {
    this.logger.log("Sport plugin deactivated");
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    this.logger.log("Sport webhook received");
    return { success: true, message: "Sportbooking behandlet", processedItems: 0 };
  }

  async getStatus(): Promise<IntegrationHealthStatus> {
    return { status: "INACTIVE", lastSyncAt: null, errorMessage: null };
  }
}
