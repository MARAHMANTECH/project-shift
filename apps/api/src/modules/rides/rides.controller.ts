// Rides controller - REST API for ride management
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { RidesService } from "./rides.service";
import { MatchFinderService } from "./match-finder.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import {
  createRideSchema,
  updateRideSchema,
  matchQuerySchema,
  type CreateRideDto,
  type UpdateRideDto,
  type MatchQueryDto,
} from "./dto/rides.dto";

@Controller("rides")
export class RidesController {
  constructor(
    private readonly ridesService: RidesService,
    private readonly matchFinderService: MatchFinderService
  ) {}

  /**
   * GET /api/v1/rides
   * List all rides in the user's organization
   */
  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("status") status?: string
  ) {
    return this.ridesService.findAll(user.organizationId, status);
  }

  /**
   * GET /api/v1/rides/match?latitude=X&longitude=Y&departureTime=Z
   * Find matching rides near a location and time
   */
  @Get("match")
  async findMatches(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(matchQuerySchema)) query: MatchQueryDto
  ) {
    return this.matchFinderService.findMatches(
      user.organizationId,
      user.id,
      query
    );
  }

  /**
   * GET /api/v1/rides/:id
   * Get a specific ride
   */
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ridesService.findOne(id, user.organizationId);
  }

  /**
   * POST /api/v1/rides
   * Create a new ride (current user becomes driver)
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(createRideSchema)) body: CreateRideDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ridesService.create(
      user.organizationId,
      user.id,
      body
    );
  }

  /**
   * PATCH /api/v1/rides/:id
   * Update a ride (driver only)
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateRideSchema)) body: UpdateRideDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ridesService.update(
      id,
      user.organizationId,
      user.id,
      body
    );
  }

  /**
   * DELETE /api/v1/rides/:id
   * Cancel a ride (soft-cancel, driver only)
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ridesService.cancel(id, user.organizationId, user.id);
  }

  /**
   * POST /api/v1/rides/:id/join
   * Join a ride as a passenger
   */
  @Post(":id/join")
  async joinRide(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ridesService.joinRide(id, user.organizationId, user.id);
  }

  /**
   * DELETE /api/v1/rides/:id/leave
   * Leave a ride as a passenger
   */
  @Delete(":id/leave")
  @HttpCode(HttpStatus.OK)
  async leaveRide(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.ridesService.leaveRide(id, user.organizationId, user.id);
    return { message: "Du er nu afmeldt køreturen." };
  }
}
