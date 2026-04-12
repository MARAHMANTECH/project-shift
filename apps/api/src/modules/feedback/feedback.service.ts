// Feedback Service — forretningslogik for bruger-feedback og indmeldinger
// Per .rules/03-multi-tenancy-security.md: ALLE queries filtrerer på organizationId
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, maks 40 linjer pr. funktion

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ChangelogService } from "../changelog/changelog.service";
import type {
  CreateFeedbackDto,
  UpdateFeedbackDto,
  ResolveFeedbackDto,
  FeedbackFilterDto,
} from "./dto/feedback.dto";

interface FeedbackStats {
  active: number;
  bugs: number;
  features: number;
  improvements: number;
  inBuild: number;
}

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly changelogService: ChangelogService
  ) {}

  /** Hent alle indmeldinger for brugerens organisation */
  async findAll(
    organizationId: string,
    filter: FeedbackFilterDto
  ): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const where: Record<string, unknown> = {
      OR: [
        { organizationId },
        { isGlobal: true },
      ],
    };

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: filter.search, mode: "insensitive" } },
            { content: { contains: filter.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return { data, total, page: filter.page, limit: filter.limit };
  }

  /** Aggregerede feedback-statistikker for organisation */
  async getStats(organizationId: string): Promise<FeedbackStats> {
    const baseWhere = {
      OR: [
        { organizationId },
        { isGlobal: true },
      ],
    };

    const [active, bugs, features, improvements, inBuild] = await Promise.all([
      this.prisma.feedback.count({
        where: { ...baseWhere, status: { not: "DONE" } },
      }),
      this.prisma.feedback.count({
        where: { ...baseWhere, type: "BUG" },
      }),
      this.prisma.feedback.count({
        where: { ...baseWhere, type: "FEATURE" },
      }),
      this.prisma.feedback.count({
        where: { ...baseWhere, type: "IMPROVEMENT" },
      }),
      this.prisma.feedback.count({
        where: { ...baseWhere, status: "IN_BUILD" },
      }),
    ]);

    return { active, bugs, features, improvements, inBuild };
  }

  /** Hent specifik indmelding (tenant-scoped) */
  async findOne(id: string, organizationId: string): Promise<unknown> {
    const entry = await this.prisma.feedback.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isGlobal: true },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException("Indmelding blev ikke fundet.");
    }
    return entry;
  }

  /** Opret ny indmelding */
  async create(
    organizationId: string,
    userId: string,
    dto: CreateFeedbackDto
  ): Promise<unknown> {
    return this.prisma.feedback.create({
      data: {
        organizationId,
        userId,
        type: dto.type,
        priority: dto.priority,
        title: dto.title,
        content: dto.content,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /** Opdater indmelding (Admin — status, prioritet etc.) */
  async update(
    id: string,
    organizationId: string,
    dto: UpdateFeedbackDto
  ): Promise<unknown> {
    await this.findOne(id, organizationId);

    return this.prisma.feedback.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /** Marker indmelding som udført + optional auto-opret changelog */
  async resolve(
    id: string,
    organizationId: string,
    dto: ResolveFeedbackDto
  ): Promise<{ feedback: unknown; changelog: unknown | null }> {
    const feedback = await this.findOne(id, organizationId);
    const typedFeedback = feedback as { title: string; type: string };

    // Opdater feedback-status til DONE
    const updatedFeedback = await this.prisma.feedback.update({
      where: { id },
      data: {
        status: "DONE",
        resolvedAt: new Date(),
      },
    });

    // Optional: Opret changelog-entry
    let changelog: unknown | null = null;
    if (dto.createChangelog && dto.changelogBuild) {
      changelog = await this.changelogService.create({
        versionBuild: dto.changelogBuild,
        type: dto.changelogType ?? (typedFeedback.type as "FEATURE" | "FIX" | "IMPROVEMENT"),
        title: dto.changelogTitle ?? typedFeedback.title,
        description: dto.changelogDescription ?? `Indmelding løst: ${typedFeedback.title}`,
        isPublished: true,
      });

      // Link changelog til feedback
      await this.prisma.feedback.update({
        where: { id },
        data: { changelogId: (changelog as { id: string }).id },
      });
    }

    return { feedback: updatedFeedback, changelog };
  }

  /** Slet indmelding (ejer eller Super Admin) */
  async remove(
    id: string,
    organizationId: string,
    userId: string,
    userRole: string
  ): Promise<{ message: string }> {
    const entry = (await this.findOne(id, organizationId)) as {
      userId: string;
    };

    // Kun ejer eller SUPER_ADMIN kan slette
    if (entry.userId !== userId && userRole !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Du har ikke tilladelse til at slette denne indmelding."
      );
    }

    await this.prisma.feedback.delete({ where: { id } });
    return { message: "Indmelding er slettet." };
  }
}
