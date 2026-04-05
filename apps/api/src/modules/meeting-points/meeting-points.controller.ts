// Meeting Points controller
import { Controller, Get, Post, Param, Body, UsePipes } from "@nestjs/common";
import { MeetingPointsService } from "./meeting-points.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { z } from "zod";

const createMeetingPointSchema = z.object({
  name: z.string().min(2, "Navn skal være mindst 2 tegn."),
  address: z.string().min(5, "Adresse skal være mindst 5 tegn."),
  pointType: z.enum([
    "TRAIN_STATION",
    "BUS_STOP",
    "PARKING_LOT",
    "COMPANY_HUB",
    "OTHER",
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type CreateMeetingPointDto = z.infer<typeof createMeetingPointSchema>;

@Controller("meeting-points")
export class MeetingPointsController {
  constructor(
    private readonly meetingPointsService: MeetingPointsService
  ) {}

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.meetingPointsService.findAll(user.organizationId);
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.meetingPointsService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles("ORG_ADMIN")
  @UsePipes(new ZodValidationPipe(createMeetingPointSchema))
  async create(
    @Body() body: CreateMeetingPointDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.meetingPointsService.create(user.organizationId, body);
  }
}
