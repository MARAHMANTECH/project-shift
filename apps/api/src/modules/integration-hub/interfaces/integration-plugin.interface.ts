// Integration Plugin Interface — core contract for all plugins
// All integration plugins MUST implement this interface

import type { IntegrationType, IntegrationStatus } from "@prisma/client";

/**
 * Health status returned by plugin getStatus()
 */
export interface IntegrationHealthStatus {
  status: IntegrationStatus;
  lastSyncAt: Date | null;
  errorMessage: string | null;
  details?: Record<string, unknown>;
}

/**
 * Result of processing a webhook event
 */
export interface WebhookResult {
  success: boolean;
  message: string;
  processedItems?: number;
}

/**
 * Plugin metadata for discovery
 */
export interface PluginMetadata {
  type: IntegrationType;
  displayName: string;
  description: string;
  iconUrl?: string;
  configSchema?: Record<string, unknown>;
}

/**
 * Core plugin contract — all integration plugins must implement this.
 * Plugins are registered in IntegrationHubService and dispatched by type.
 */
export interface IntegrationPlugin {
  /** Plugin metadata for display and discovery */
  readonly metadata: PluginMetadata;

  /**
   * Called when the plugin is activated for an organization.
   * Should validate config and establish connections.
   */
  onActivate(config: Record<string, unknown>): Promise<void>;

  /**
   * Called when the plugin is deactivated.
   * Should clean up connections and resources.
   */
  onDeactivate(): Promise<void>;

  /**
   * Handle an incoming webhook event from the external service.
   */
  handleWebhook(payload: unknown): Promise<WebhookResult>;

  /**
   * Check the health/status of the integration.
   */
  getStatus(): Promise<IntegrationHealthStatus>;
}
