// Changelog Service — forretningslogik for versionshistorik
// Per .rules/02-tech-standards.md: Eksplicitte returtyper, maks 40 linjer pr. funktion
// Per .rules/03-multi-tenancy-security.md: organizationId er optional (globale changelogs)

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type {
  CreateChangelogDto,
  UpdateChangelogDto,
  ChangelogFilterDto,
} from "./dto/changelog.dto";

interface ChangelogStats {
  total: number;
  features: number;
  fixes: number;
  improvements: number;
  latestBuild: number;
}

@Injectable()
export class ChangelogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Hent alle publicerede changelogs med filtrering */
  async findAll(filter: ChangelogFilterDto): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.changelog.findMany({
        where,
        orderBy: [
          { versionBuild: "desc" },
          { createdAt: "desc" },
        ],
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.changelog.count({ where }),
    ]);

    return { data, total, page: filter.page, limit: filter.limit };
  }

  /** Aggregerede changelog-statistikker */
  async getStats(): Promise<ChangelogStats> {
    const [total, features, fixes, improvements, latest] = await Promise.all([
      this.prisma.changelog.count({ where: { isPublished: true } }),
      this.prisma.changelog.count({ where: { isPublished: true, type: "FEATURE" } }),
      this.prisma.changelog.count({ where: { isPublished: true, type: "FIX" } }),
      this.prisma.changelog.count({ where: { isPublished: true, type: "IMPROVEMENT" } }),
      this.prisma.changelog.findFirst({
        where: { isPublished: true },
        orderBy: { versionBuild: "desc" },
        select: { versionBuild: true },
      }),
    ]);

    return {
      total,
      features,
      fixes,
      improvements,
      latestBuild: latest?.versionBuild ?? 0,
    };
  }

  /** Hent specifik changelog entry */
  async findOne(id: string): Promise<unknown> {
    const entry = await this.prisma.changelog.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException("Changelog-entry blev ikke fundet.");
    }
    return entry;
  }

  /** Opret ny changelog entry (Admin) */
  async create(dto: CreateChangelogDto): Promise<unknown> {
    return this.prisma.changelog.create({
      data: {
        versionBuild: dto.versionBuild,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
      },
    });
  }

  /** Opdater changelog entry (Admin) */
  async update(id: string, dto: UpdateChangelogDto): Promise<unknown> {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };

    // Auto-sæt publishedAt ved publicering
    if (dto.isPublished === true) {
      data.publishedAt = new Date();
    }

    return this.prisma.changelog.update({
      where: { id },
      data,
    });
  }

  /** Slet changelog entry (Super Admin) */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.changelog.delete({ where: { id } });
    return { message: "Changelog-entry er slettet." };
  }
}
