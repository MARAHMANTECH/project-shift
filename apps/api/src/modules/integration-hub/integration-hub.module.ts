// Integration Hub Module
// Registers all integration plugins and the hub service

import { Module } from "@nestjs/common";
import { IntegrationHubController } from "./integration-hub.controller";
import { IntegrationHubService } from "./integration-hub.service";
import { CanteenPlugin } from "./plugins/canteen/canteen.plugin";
import { DeliveryPlugin } from "./plugins/delivery/delivery.plugin";
import { SportPlugin } from "./plugins/sport/sport.plugin";

@Module({
  controllers: [IntegrationHubController],
  providers: [
    IntegrationHubService,
    CanteenPlugin,
    DeliveryPlugin,
    SportPlugin,
  ],
  exports: [IntegrationHubService],
})
export class IntegrationHubModule {}
