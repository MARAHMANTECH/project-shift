// Auth module — NextAuth.js + jose JWT-verificering
// Bruges JwtAuthGuard i produktion, DevAuthGuard i development.
// Begge guards respekterer @Public() decorator.

import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { DevAuthGuard } from "./guards/dev-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

const isProduction = process.env.NODE_ENV === "production";

@Module({
  providers: [
    // Global auth guard - applies to ALL routes
    // DevAuthGuard (development) or JwtAuthGuard (production)
    {
      provide: APP_GUARD,
      useClass: isProduction ? JwtAuthGuard : DevAuthGuard,
    },
    // JWT guard always available (for JIT provisioning in dev too)
    JwtAuthGuard,
    // Global roles guard - checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
