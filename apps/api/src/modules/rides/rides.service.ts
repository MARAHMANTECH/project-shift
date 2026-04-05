// Rides service - core business logic for ride CRUD operations
// All queries include organization_id filter per .rules/03

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EsgService } from "../esg/esg.service";
import type { Ride, RidePassenger } from "@prisma/client";
import type { CreateRideDto, UpdateRideDto } from "./dto/rides.dto";

// Include relations for rich responses
const RIDE_INCLUDE = {
  driver: { select: { id: true, firstName: true, lastName: true, email: true } },
  departurePoint: true,
  arrivalPoint: true,
  passengers: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly esgService: EsgService
  ) {}

  /**
   * List all rides for an organization.
   * Filters to SCHEDULED and IN_PROGRESS by default.
   */
  async findAll(
    organizationId: string,
    status?: string
  ): Promise<Ride[]> {
    const statusFilter = status
      ? { status: status as Ride["status"] }
      : { status: { in: ["SCHEDULED" as const, "IN_PROGRESS" as const] } };

    return this.prisma.ride.findMany({
      where: { organizationId, ...statusFilter },
      include: RIDE_INCLUDE,
      orderBy: { departureTime: "asc" },
    });
  }

  /**
   * Get a specific ride by ID.
   */
  async findOne(id: string, organizationId: string): Promise<Ride> {
    const ride = await this.prisma.ride.findFirst({
      where: { id, organizationId },
      include: RIDE_INCLUDE,
    });

    if (!ride) {
      throw new NotFoundException(`Køretur med ID '${id}' blev ikke fundet.`);
    }

    return ride;
  }

  /**
   * Create a new ride (user becomes driver).
   */
  async create(
    organizationId: string,
    driverId: string,
    input: CreateRideDto
  ): Promise<Ride> {
    // Validate departure and arrival are different
    if (input.departurePointId === input.arrivalPointId) {
      throw new BadRequestException(
        "Afgang og ankomst kan ikke være det samme punkt."
      );
    }

    // Validate departure is in the future
    if (new Date(input.departureTime) <= new Date()) {
      throw new BadRequestException("Afgangstidspunkt skal ligge i fremtiden.");
    }

    // Verify meeting points exist in same org
    const [departure, arrival] = await Promise.all([
      this.prisma.meetingPoint.findFirst({
        where: { id: input.departurePointId, organizationId, isActive: true },
      }),
      this.prisma.meetingPoint.findFirst({
        where: { id: input.arrivalPointId, organizationId, isActive: true },
      }),
    ]);

    if (!departure) {
      throw new NotFoundException("Afgangspunkt blev ikke fundet.");
    }
    if (!arrival) {
      throw new NotFoundException("Ankomstpunkt blev ikke fundet.");
    }

    const ride = await this.prisma.ride.create({
      data: {
        organizationId,
        driverId,
        departurePointId: input.departurePointId,
        arrivalPointId: input.arrivalPointId,
        departureTime: new Date(input.departureTime),
        availableSeats: input.availableSeats,
        notes: input.notes,
      },
      include: RIDE_INCLUDE,
    });

    await this.auditService.logAction({
      organizationId,
      userId: driverId,
      action: "RIDE_CREATED",
      entity: "Ride",
      entityId: ride.id,
      metadata: {
        departurePointId: input.departurePointId,
        arrivalPointId: input.arrivalPointId,
        departureTime: input.departureTime,
      },
    });

    return ride;
  }

  /**
   * Update a ride (only the driver can update their own ride).
   */
  async update(
    id: string,
    organizationId: string,
    userId: string,
    input: UpdateRideDto
  ): Promise<Ride> {
    const existing = await this.findOne(id, organizationId);

    if ((existing as Ride & { driverId: string }).driverId !== userId) {
      throw new ForbiddenException("Kun chaufføren kan redigere køreturen.");
    }

    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      throw new BadRequestException(
        "Afsluttede eller aflyste ture kan ikke redigeres."
      );
    }

    const ride = await this.prisma.ride.update({
      where: { id },
      data: {
        ...(input.departureTime && {
          departureTime: new Date(input.departureTime),
        }),
        ...(input.availableSeats !== undefined && {
          availableSeats: input.availableSeats,
        }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.status && { status: input.status }),
      },
      include: RIDE_INCLUDE,
    });

    // Trigger ESG calculation when ride is completed
    if (input.status === "COMPLETED") {
      try {
        await this.esgService.logCompletedRide(id, organizationId, userId);
      } catch (error) {
        console.error("[ESG] Failed to log completed ride:", error);
        // ESG logging should never crash the ride update
      }
    }

    await this.auditService.logAction({
      organizationId,
      userId,
      action: "RIDE_UPDATED",
      entity: "Ride",
      entityId: id,
      metadata: { changes: input },
    });

    return ride;
  }

  /**
   * Cancel a ride (soft-cancel via status change).
   */
  async cancel(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<Ride> {
    return this.update(id, organizationId, userId, { status: "CANCELLED" });
  }

  /**
   * Join a ride as a passenger.
   */
  async joinRide(
    rideId: string,
    organizationId: string,
    userId: string
  ): Promise<RidePassenger> {
    const ride = await this.findOne(rideId, organizationId);

    if (ride.status !== "SCHEDULED") {
      throw new BadRequestException("Kun planlagte ture kan tilmeldes.");
    }

    if ((ride as Ride & { driverId: string }).driverId === userId) {
      throw new BadRequestException("Du kan ikke tilmelde dig din egen tur.");
    }

    // Check available seats
    const passengerCount = await this.prisma.ridePassenger.count({
      where: {
        rideId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (passengerCount >= ride.availableSeats) {
      throw new BadRequestException("Ingen ledige pladser på denne tur.");
    }

    // Check if user already joined
    const existing = await this.prisma.ridePassenger.findUnique({
      where: { rideId_userId: { rideId, userId } },
    });

    if (existing && existing.status !== "CANCELLED") {
      throw new BadRequestException("Du er allerede tilmeldt denne tur.");
    }

    const passenger = existing
      ? await this.prisma.ridePassenger.update({
          where: { id: existing.id },
          data: { status: "CONFIRMED" },
        })
      : await this.prisma.ridePassenger.create({
          data: { rideId, userId, status: "CONFIRMED" },
        });

    await this.auditService.logAction({
      organizationId,
      userId,
      action: "RIDE_JOINED",
      entity: "RidePassenger",
      entityId: passenger.id,
      metadata: { rideId },
    });

    return passenger;
  }

  /**
   * Leave a ride as a passenger.
   */
  async leaveRide(
    rideId: string,
    organizationId: string,
    userId: string
  ): Promise<void> {
    const passenger = await this.prisma.ridePassenger.findUnique({
      where: { rideId_userId: { rideId, userId } },
    });

    if (!passenger || passenger.status === "CANCELLED") {
      throw new NotFoundException("Du er ikke tilmeldt denne tur.");
    }

    await this.prisma.ridePassenger.update({
      where: { id: passenger.id },
      data: { status: "CANCELLED" },
    });

    await this.auditService.logAction({
      organizationId,
      userId,
      action: "RIDE_LEFT",
      entity: "RidePassenger",
      entityId: passenger.id,
      metadata: { rideId },
    });
  }
}
