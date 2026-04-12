// Feedback Controller — REST API for bruger-indmeldinger
// Per ARCHITECTURE.md: /api/v1/feedback prefix, RFC 7807 fejl
// Per .rules/03-multi-tenancy-security.md: ALLE endpoints filtrerer på organizationId

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
import { FeedbackService } from "./feedback.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  resolveFeedbackSchema,
  feedbackFilterSchema,
  type CreateFeedbackDto,
  type UpdateFeedbackDto,
  type ResolveFeedbackDto,
  type FeedbackFilterDto,
} from "./dto/feedback.dto";

@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * GET /api/v1/feedback
   * Liste alle indmeldinger for brugerens organisation
   */
  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(feedbackFilterSchema)) filter: FeedbackFilterDto
  ): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    return this.feedbackService.findAll(user.organizationId, filter);
  }

  /**
   * GET /api/v1/feedback/stats
   * Aggregerede feedback-statistikker for organisation
   */
  @Get("stats")
  async getStats(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{
    active: number;
    bugs: number;
    features: number;
    improvements: number;
    inBuild: number;
  }> {
    return this.feedbackService.getStats(user.organizationId);
  }

  /**
   * GET /api/v1/feedback/:id
   * Hent specifik indmelding (tenant-scoped)
   */
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<unknown> {
    return this.feedbackService.findOne(id, user.organizationId);
  }

  /**
   * POST /api/v1/feedback
   * Opret ny indmelding (alle brugere)
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(createFeedbackSchema)) body: CreateFeedbackDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<unknown> {
    return this.feedbackService.create(
      user.organizationId,
      user.id,
      body
    );
  }

  /**
   * PATCH /api/v1/feedback/:id
   * Opdater status/prioritet på indmelding (ORG_ADMIN / SUPER_ADMIN)
   */
  @Patch(":id")
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateFeedbackSchema)) body: UpdateFeedbackDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<unknown> {
    return this.feedbackService.update(id, user.organizationId, body);
  }

  /**
   * PATCH /api/v1/feedback/:id/resolve
   * Marker indmelding som udført + optional changelog-oprettelse
   */
  @Patch(":id/resolve")
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async resolve(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resolveFeedbackSchema)) body: ResolveFeedbackDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ feedback: unknown; changelog: unknown | null }> {
    return this.feedbackService.resolve(id, user.organizationId, body);
  }

  /**
   * DELETE /api/v1/feedback/:id
   * Slet indmelding (ejer eller SUPER_ADMIN)
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ message: string }> {
    return this.feedbackService.remove(
      id,
      user.organizationId,
      user.id,
      user.role
    );
  }
}
