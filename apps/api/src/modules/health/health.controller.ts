// Health check controller — offentlig endpoint til Railway healthcheck
// Dekoreret med @Public() så auth guards springes over

import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { PrismaService } from "../../common/prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    version: string;
  }> {
    let dbStatus = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    return {
      status: dbStatus === "ok" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      version: process.env.npm_package_version ?? "0.8.1",
    };
  }
}
