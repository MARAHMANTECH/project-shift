// Changelog Controller — REST API for versionshistorik
// Per ARCHITECTURE.md: /api/v1/changelog prefix, RFC 7807 fejl
// Per .rules/02-tech-standards.md: Eksplicitte returtyper

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
import { ChangelogService } from "./changelog.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import {
  createChangelogSchema,
  updateChangelogSchema,
  changelogFilterSchema,
  type CreateChangelogDto,
  type UpdateChangelogDto,
  type ChangelogFilterDto,
} from "./dto/changelog.dto";

@Controller("changelog")
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  /**
   * GET /api/v1/changelog
   * Liste alle publicerede changelogs (ingen auth krav for læsning)
   */
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(changelogFilterSchema)) filter: ChangelogFilterDto
  ): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    return this.changelogService.findAll(filter);
  }

  /**
   * GET /api/v1/changelog/stats
   * Aggregerede changelog-statistikker
   */
  @Get("stats")
  async getStats(): Promise<{
    total: number;
    features: number;
    fixes: number;
    improvements: number;
    latestBuild: number;
  }> {
    return this.changelogService.getStats();
  }

  /**
   * GET /api/v1/changelog/:id
   * Hent specifik changelog entry
   */
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<unknown> {
    return this.changelogService.findOne(id);
  }

  /**
   * POST /api/v1/changelog
   * Opret ny changelog entry (ORG_ADMIN / SUPER_ADMIN)
   */
  @Post()
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async create(
    @Body(new ZodValidationPipe(createChangelogSchema)) body: CreateChangelogDto,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<unknown> {
    return this.changelogService.create(body);
  }

  /**
   * PATCH /api/v1/changelog/:id
   * Opdater changelog entry (ORG_ADMIN / SUPER_ADMIN)
   */
  @Patch(":id")
  @Roles("ORG_ADMIN", "SUPER_ADMIN")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateChangelogSchema)) body: UpdateChangelogDto,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<unknown> {
    return this.changelogService.update(id, body);
  }

  /**
   * DELETE /api/v1/changelog/:id
   * Slet changelog entry (kun SUPER_ADMIN)
   */
  @Delete(":id")
  @Roles("SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param("id") id: string,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<{ message: string }> {
    return this.changelogService.remove(id);
  }
}
