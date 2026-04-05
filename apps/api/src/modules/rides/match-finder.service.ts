// Match-finder service - PostGIS-based ride matching
// Per .rules/02: ALL geographic calculations MUST use PostGIS SQL functions
// NEVER do distance calculations in JavaScript

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { MatchQueryDto } from "./dto/rides.dto";

export interface MatchResult {
  id: string;
  driverId: string;
  driverFirstName: string;
  driverLastName: string;
  departurePointId: string;
  departurePointName: string;
  arrivalPointId: string;
  arrivalPointName: string;
  departureTime: Date;
  availableSeats: number;
  distanceMeters: number;
  timeDifferenceMinutes: number;
  matchScore: number;
  notes: string | null;
}

@Injectable()
export class MatchFinderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find rides matching the user's desired departure location and time.
   *
   * Uses PostGIS ST_DWithin for spatial proximity search and
   * a weighted score algorithm:
   *   score = (1 - distance_factor) * 0.6 + (1 - time_factor) * 0.4
   *
   * @param organizationId - Tenant context (mandatory)
   * @param userId - Exclude user's own rides
   * @param query - Search parameters (location, time, radius)
   * @returns Sorted array of matching rides (best match first)
   */
  async findMatches(
    organizationId: string,
    userId: string,
    query: MatchQueryDto
  ): Promise<MatchResult[]> {
    const desiredTime = new Date(query.departureTime);
    const radiusMeters = query.radiusMeters;
    const timeWindowMinutes = query.timeWindowMinutes;

    // Raw SQL query using PostGIS for geographic calculations
    // Per .rules/02: NEVER do distance calculations in JS
    const results = await this.prisma.$queryRaw<MatchResult[]>`
      SELECT
        r.id,
        r.driver_id AS "driverId",
        u.first_name AS "driverFirstName",
        u.last_name AS "driverLastName",
        r.departure_point_id AS "departurePointId",
        mp_dep.name AS "departurePointName",
        r.arrival_point_id AS "arrivalPointId",
        mp_arr.name AS "arrivalPointName",
        r.departure_time AS "departureTime",
        r.available_seats AS "availableSeats",
        r.notes,
        -- Distance in meters from user's location to departure point
        ROUND(
          ST_Distance(
            mp_dep.location,
            ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography
          )
        )::integer AS "distanceMeters",
        -- Time difference in minutes
        ROUND(
          ABS(
            EXTRACT(EPOCH FROM (r.departure_time - ${desiredTime}::timestamptz)) / 60.0
          )
        )::integer AS "timeDifferenceMinutes",
        -- Match score: weighted combination of distance and time proximity
        -- Higher score = better match (0.0 to 1.0)
        ROUND(
          (
            (1.0 - LEAST(
              ST_Distance(
                mp_dep.location,
                ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography
              ) / ${radiusMeters}::float,
              1.0
            )) * 0.6
            +
            (1.0 - LEAST(
              ABS(EXTRACT(EPOCH FROM (r.departure_time - ${desiredTime}::timestamptz)) / 60.0)
                / ${timeWindowMinutes}::float,
              1.0
            )) * 0.4
          )::numeric,
          4
        )::float AS "matchScore"
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      JOIN meeting_points mp_dep ON r.departure_point_id = mp_dep.id
      JOIN meeting_points mp_arr ON r.arrival_point_id = mp_arr.id
      WHERE r.organization_id = ${organizationId}
        AND r.driver_id != ${userId}
        AND r.status = 'SCHEDULED'
        AND r.available_seats > (
          SELECT COUNT(*) FROM ride_passengers rp
          WHERE rp.ride_id = r.id AND rp.status IN ('PENDING', 'CONFIRMED')
        )
        AND r.departure_time BETWEEN
          ${desiredTime}::timestamptz - (${timeWindowMinutes} || ' minutes')::interval
          AND
          ${desiredTime}::timestamptz + (${timeWindowMinutes} || ' minutes')::interval
        AND ST_DWithin(
          mp_dep.location,
          ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY "matchScore" DESC, "distanceMeters" ASC
      LIMIT 20
    `;

    return results;
  }
}
