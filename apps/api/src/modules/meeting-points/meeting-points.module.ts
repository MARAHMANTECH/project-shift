import { Module } from "@nestjs/common";
import { MeetingPointsController } from "./meeting-points.controller";
import { MeetingPointsService } from "./meeting-points.service";

@Module({
  controllers: [MeetingPointsController],
  providers: [MeetingPointsService],
  exports: [MeetingPointsService],
})
export class MeetingPointsModule {}
