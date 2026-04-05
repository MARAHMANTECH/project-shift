// Clerk Webhook Controller
// Endpoint: POST /api/v1/webhooks/clerk
// Verifies Svix signature, dispatches to service handlers

import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Logger,
  HttpCode,
} from "@nestjs/common";
import { Webhook } from "svix";
import { envConfig } from "../../../common/config/env.validation";
import { ClerkWebhookService } from "./clerk-webhook.service";
import { Public } from "../decorators/public.decorator";

interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

@Controller("webhooks")
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(private readonly webhookService: ClerkWebhookService) {}

  @Public()
  @Post("clerk")
  @HttpCode(200)
  async handleClerkWebhook(
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string,
    @Req() req: { rawBody?: Buffer }
  ): Promise<{ received: boolean }> {
    const webhookSecret = envConfig.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      this.logger.warn(
        "CLERK_WEBHOOK_SECRET not configured, skipping verification"
      );
      throw new BadRequestException(
        "Webhook-verifikation er ikke konfigureret."
      );
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException("Manglende Svix-headers.");
    }

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      const body = req.rawBody;
      if (!body) {
        throw new Error("rawBody is missing from request");
      }

      evt = wh.verify(body.toString(), {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : "Unknown"}`
      );
      throw new BadRequestException("Ugyldig webhook-signatur.");
    }

    // Dispatch to handlers
    const { type, data } = evt;
    this.logger.log(`Webhook received: ${type}`);

    try {
      switch (type) {
        case "user.created":
          await this.webhookService.handleUserCreated(
            data as unknown as Parameters<typeof this.webhookService.handleUserCreated>[0]
          );
          break;

        case "user.updated":
          await this.webhookService.handleUserUpdated(
            data as unknown as Parameters<typeof this.webhookService.handleUserUpdated>[0]
          );
          break;

        case "user.deleted":
          await this.webhookService.handleUserDeleted(
            data as unknown as { id: string }
          );
          break;

        case "organization.created":
          await this.webhookService.handleOrganizationCreated(
            data as unknown as Parameters<
              typeof this.webhookService.handleOrganizationCreated
            >[0]
          );
          break;

        case "organizationMembership.created":
          await this.webhookService.handleOrgMembershipCreated(
            data as unknown as Parameters<
              typeof this.webhookService.handleOrgMembershipCreated
            >[0]
          );
          break;

        case "organizationMembership.deleted":
          await this.webhookService.handleOrgMembershipDeleted(
            data as unknown as Parameters<
              typeof this.webhookService.handleOrgMembershipDeleted
            >[0]
          );
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${type}`);
      }
    } catch (error) {
      this.logger.error(
        `Webhook handler error for ${type}: ${error instanceof Error ? error.message : "Unknown"}`
      );
      // Return 200 to prevent Clerk from retrying excessively
      // Error is logged and can be investigated
    }

    return { received: true };
  }
}
