// Clerk Module — eksporterer ClerkService globalt
// Per ARCHITECTURE.md: ClerkService bruges af ClerkAuthGuard til JWT-verifikation

import { Global, Module } from "@nestjs/common";
import { ClerkService } from "./clerk.service";

@Global()
@Module({
  providers: [ClerkService],
  exports: [ClerkService],
})
export class ClerkModule {}
