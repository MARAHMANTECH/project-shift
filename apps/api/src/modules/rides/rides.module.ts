import { Module } from "@nestjs/common";
import { RidesController } from "./rides.controller";
import { RidesService } from "./rides.service";
import { MatchFinderService } from "./match-finder.service";
import { EsgModule } from "../esg/esg.module";

@Module({
  imports: [EsgModule],
  controllers: [RidesController],
  providers: [RidesService, MatchFinderService],
  exports: [RidesService],
})
export class RidesModule {}
