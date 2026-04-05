// Meeting Points service - CRUD for public pickup/dropoff locations
// Privacy-by-Design: coordinates are rounded to 3 decimal places

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { MeetingPoint, PointType } from "@prisma/client";

interface CreateMeetingPointInput {
  name: string;
  address: string;
  pointType: PointType;
  latitude: number;
  longitude: number;
}

@Injectable()
export class MeetingPointsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all active meeting points for an organization.
   */
  async findAll(organizationId: string): Promise<MeetingPoint[]> {
    return this.prisma.meetingPoint.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get a specific meeting point by ID.
   */
  async findOne(
    id: string,
    organizationId: string
  ): Promise<MeetingPoint> {
    const point = await this.prisma.meetingPoint.findFirst({
      where: { id, organizationId, isActive: true },
    });

    if (!point) {
      throw new NotFoundException(
        `Opsamlingspunkt med ID '${id}' blev ikke fundet.`
      );
    }

    return point;
  }

  /**
   * Create a new meeting point.
   * Coordinates are rounded to 3 decimal places for privacy (~111m precision).
   */
  async create(
    organizationId: string,
    input: CreateMeetingPointInput
  ): Promise<MeetingPoint> {
    return this.prisma.meetingPoint.create({
      data: {
        organizationId,
        name: input.name,
        address: input.address,
        pointType: input.pointType,
        latitude: this.roundCoord(input.latitude),
        longitude: this.roundCoord(input.longitude),
      },
    });
  }

  /**
   * Round coordinate to 3 decimal places for privacy.
   * 3 decimals = ~111 meter precision.
   */
  private roundCoord(value: number): number {
    return Math.round(value * 1000) / 1000;
  }
}
