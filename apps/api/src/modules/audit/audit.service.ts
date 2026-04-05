// Audit service - centralized action logging
// Per .rules/03: ALL destructive operations MUST be logged

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma } from "@prisma/client";

interface AuditLogInput {
  organizationId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an auditable action. Uses raw PrismaService (not tenant-scoped)
   * because audit logs should always be written regardless of RLS context.
   */
  async logAction(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          metadata: input.metadata
            ? (input.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        },
      });
    } catch (error) {
      // Audit logging must NEVER crash the main operation
      console.error("[AUDIT] Failed to write audit log:", error);
    }
  }
}
