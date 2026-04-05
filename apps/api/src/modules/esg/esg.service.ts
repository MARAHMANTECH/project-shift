// ESG Service - triggers CO2 calculation when a ride is completed
// Per .rules/03: ESG data is IMMUTABLE after creation. No editing allowed.

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { calculateCo2Savings } from "@project-shift/esg-core";
import { esgConfig } from "../../common/config/esg.config";
import type { EsgTripLog } from "@prisma/client";

@Injectable()
export class EsgService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Calculate and log CO2 savings when a ride is completed.
   * Creates an immutable EsgTripLog entry.
   *
   * Called by RidesService when status changes to COMPLETED.
   */
  async logCompletedRide(
    rideId: string,
    organizationId: string,
    userId: string
  ): Promise<EsgTripLog> {
    // Fetch ride with passenger count
    const ride = await this.prisma.ride.findFirst({
      where: { id: rideId, organizationId },
      include: {
        passengers: {
          where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        },
      },
    });

    if (!ride) {
      throw new Error(`Ride ${rideId} not found for ESG logging.`);
    }

    const passengerCount = ride.passengers.length;

    // Use PostGIS to calculate distance if not already set
    let distanceKm = ride.distanceKm;
    if (!distanceKm) {
      distanceKm = await this.calculateDistanceKm(
        ride.departurePointId,
        ride.arrivalPointId
      );

      // Update ride with calculated distance
      await this.prisma.ride.update({
        where: { id: rideId },
        data: { distanceKm },
      });
    }

    // Calculate CO2 savings using pure function from esg-core
    const result = calculateCo2Savings({
      distanceKm,
      passengerCount,
      emissionFactorKgPerKm: esgConfig.emissionFactorKgPerKm,
    });

    // Create immutable ESG log entry
    const esgLog = await this.prisma.esgTripLog.create({
      data: {
        organizationId,
        rideId,
        distanceKm,
        passengerCount,
        co2SavedKg: result.co2SavedKg,
        emissionFactor: esgConfig.emissionFactorKgPerKm,
        formulaVersion: result.formulaVersion,
      },
    });

    await this.auditService.logAction({
      organizationId,
      userId,
      action: "ESG_TRIP_LOGGED",
      entity: "EsgTripLog",
      entityId: esgLog.id,
      metadata: {
        rideId,
        distanceKm,
        passengerCount,
        co2SavedKg: result.co2SavedKg,
        formulaVersion: result.formulaVersion,
      },
    });

    return esgLog;
  }

  /**
   * Get aggregated ESG summary for an organization.
   */
  async getOrgSummary(
    organizationId: string,
    periodStart?: Date,
    periodEnd?: Date
  ) {
    const where = {
      organizationId,
      ...(periodStart && periodEnd
        ? { calculatedAt: { gte: periodStart, lte: periodEnd } }
        : {}),
    };

    const aggregate = await this.prisma.esgTripLog.aggregate({
      where,
      _sum: { co2SavedKg: true, distanceKm: true },
      _count: { id: true },
      _avg: { co2SavedKg: true },
    });

    return {
      totalTrips: aggregate._count.id,
      totalDistanceKm: aggregate._sum.distanceKm ?? 0,
      totalCo2SavedKg: aggregate._sum.co2SavedKg ?? 0,
      averageCo2PerTrip: aggregate._avg.co2SavedKg ?? 0,
    };
  }

  /**
   * Calculate straight-line distance between two meeting points using PostGIS.
   * Per .rules/02: NEVER calculate distances in JavaScript.
   */
  private async calculateDistanceKm(
    departurePointId: string,
    arrivalPointId: string
  ): Promise<number> {
    const result = await this.prisma.$queryRaw<
      Array<{ distance_km: number }>
    >`
      SELECT ROUND(
        (ST_Distance(mp1.location, mp2.location) / 1000.0)::numeric,
        2
      )::float AS distance_km
      FROM meeting_points mp1, meeting_points mp2
      WHERE mp1.id = ${departurePointId}
        AND mp2.id = ${arrivalPointId}
    `;

    return result[0]?.distance_km ?? 0;
  }
}
