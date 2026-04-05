// Auth module - provides guards and decorators
// Uses ClerkAuthGuard in production, DevAuthGuard in development.
// Both guards respect @Public() decorator for webhook endpoints.

import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { DevAuthGuard } from "./guards/dev-auth.guard";
import { ClerkAuthGuard } from "./guards/clerk-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { ClerkWebhookController } from "./webhooks/clerk-webhook.controller";
import { ClerkWebhookService } from "./webhooks/clerk-webhook.service";

const isProduction = process.env.NODE_ENV === "production";

@Module({
  controllers: [ClerkWebhookController],
  providers: [
    ClerkWebhookService,
    // Global auth guard - applies to ALL routes
    // devAuthGuard (development) or ClerkAuthGuard (production)
    {
      provide: APP_GUARD,
      useClass: isProduction ? ClerkAuthGuard : DevAuthGuard,
    },
    // Clerk guard always available (for JIT provisioning in dev too)
    ClerkAuthGuard,
    // Global roles guard - checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [ClerkWebhookService],
})
export class AuthModule {}
