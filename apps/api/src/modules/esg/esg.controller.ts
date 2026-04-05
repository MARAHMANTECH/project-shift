// ESG controller - ESG dashboard data API
import { Controller, Get, Query } from "@nestjs/common";
import { EsgService } from "./esg.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/auth.types";

@Controller("esg")
export class EsgController {
  constructor(private readonly esgService: EsgService) {}

  /**
   * GET /api/v1/esg/summary
   * Get ESG summary for the user's organization
   */
  @Get("summary")
  async getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query("periodStart") periodStart?: string,
    @Query("periodEnd") periodEnd?: string
  ) {
    return this.esgService.getOrgSummary(
      user.organizationId,
      periodStart ? new Date(periodStart) : undefined,
      periodEnd ? new Date(periodEnd) : undefined
    );
  }
}
