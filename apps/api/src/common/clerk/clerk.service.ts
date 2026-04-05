// ClerkService — NestJS injectable wrapper for @clerk/backend
// Bruger createClerkClient til JWT-verifikation og bruger-opslag

import { Injectable } from "@nestjs/common";
import { createClerkClient, type ClerkClient } from "@clerk/backend";
import { envConfig } from "../config/env.validation";

@Injectable()
export class ClerkService {
  public readonly clerkClient: ClerkClient;

  constructor() {
    if (!envConfig.CLERK_SECRET_KEY) {
      // I development uden Clerk-nøgler: opret en dummy client
      // DevAuthGuard bruges i stedet — se auth.module.ts
      this.clerkClient = null as unknown as ClerkClient;
      return;
    }

    this.clerkClient = createClerkClient({
      secretKey: envConfig.CLERK_SECRET_KEY,
    });
  }

  /**
   * Tjek om Clerk er konfigureret.
   * Bruges til at afgøre om ClerkAuthGuard eller DevAuthGuard skal bruges.
   */
  isConfigured(): boolean {
    return this.clerkClient !== null;
  }
}
