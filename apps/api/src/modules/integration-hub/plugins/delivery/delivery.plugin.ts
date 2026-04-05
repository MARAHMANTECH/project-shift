// Delivery Plugin — skeleton for Wolt for Work integration
// Enables food delivery ordering through Project SHIFT

import { Injectable, Logger } from "@nestjs/common";
import type {
  IntegrationPlugin,
  PluginMetadata,
  IntegrationHealthStatus,
  WebhookResult,
} from "../../interfaces/integration-plugin.interface";

@Injectable()
export class DeliveryPlugin implements IntegrationPlugin {
  private readonly logger = new Logger(DeliveryPlugin.name);

  readonly metadata: PluginMetadata = {
    type: "DELIVERY_WOLT",
    displayName: "Wolt for Work",
    description:
      "Integrér Wolt for Work så medarbejdere kan bestille frokostlevering direkte via Project SHIFT. Udgifter logges automatisk.",
    configSchema: {
      woltApiKey: { type: "string", required: true, label: "Wolt API-nøgle", secret: true },
      companyId: { type: "string", required: true, label: "Wolt Company ID" },
      maxOrderAmount: { type: "number", required: false, label: "Max ordrebeløb (DKK)", default: 150 },
    },
  };

  async onActivate(config: Record<string, unknown>): Promise<void> {
    this.logger.log(`Delivery plugin activated: ${JSON.stringify(Object.keys(config))}`);
  }

  async onDeactivate(): Promise<void> {
    this.logger.log("Delivery plugin deactivated");
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    this.logger.log("Delivery webhook received");
    return { success: true, message: "Leveringsordre behandlet", processedItems: 0 };
  }

  async getStatus(): Promise<IntegrationHealthStatus> {
    return { status: "INACTIVE", lastSyncAt: null, errorMessage: null };
  }
}
