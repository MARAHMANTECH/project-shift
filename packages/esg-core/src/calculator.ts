// ESG Calculator - PURE FUNCTIONS (no side effects)
// Formula v1.0: CO2_saved = distance_km * emission_factor * (1 - 1/total_occupants)
//
// Rationale: When N people share a ride instead of each driving alone,
// the savings per trip = distance * emission * (N-1)/N = distance * emission * (1 - 1/N)

import type { EsgCalculationInput, EsgCalculationResult } from "@project-shift/shared-types";
import { ESG_DEFAULTS, MIN_OCCUPANTS_FOR_SAVINGS } from "./constants";

/**
 * Calculate CO2 savings for a single shared ride.
 *
 * This is a PURE FUNCTION - no database access, no side effects.
 * 100% test coverage is MANDATORY per .rules/03-multi-tenancy-security.md.
 *
 * @param input - Distance, passenger count, and emission factor
 * @returns Calculated CO2 savings result
 * @throws Error if input values are invalid
 *
 * @example
 * // 30 km ride with 2 passengers (3 total occupants)
 * calculateCo2Savings({ distanceKm: 30, passengerCount: 2, emissionFactorKgPerKm: 0.12 })
 * // => { co2SavedKg: 2.4, totalOccupants: 3, formulaVersion: "v1.0" }
 */
export function calculateCo2Savings(input: EsgCalculationInput): EsgCalculationResult {
  validateInput(input);

  const totalOccupants = input.passengerCount + 1; // passengers + driver

  if (totalOccupants < MIN_OCCUPANTS_FOR_SAVINGS) {
    return {
      co2SavedKg: 0,
      totalOccupants,
      formulaVersion: ESG_DEFAULTS.formulaVersion,
    };
  }

  // Formula v1.0: distance * emission_factor * (1 - 1/total_occupants)
  const savingsRatio = 1 - 1 / totalOccupants;
  const co2SavedKg = roundToDecimals(
    input.distanceKm * input.emissionFactorKgPerKm * savingsRatio,
    4
  );

  return {
    co2SavedKg,
    totalOccupants,
    formulaVersion: ESG_DEFAULTS.formulaVersion,
  };
}

/**
 * Calculate aggregated ESG summary for a collection of trip logs.
 *
 * @param tripLogs - Array of individual trip calculation results
 * @returns Aggregated totals
 */
export function calculateOrgSummary(
  tripLogs: ReadonlyArray<{ distanceKm: number; co2SavedKg: number }>
): { totalTrips: number; totalDistanceKm: number; totalCo2SavedKg: number; averageCo2PerTrip: number } {
  if (tripLogs.length === 0) {
    return {
      totalTrips: 0,
      totalDistanceKm: 0,
      totalCo2SavedKg: 0,
      averageCo2PerTrip: 0,
    };
  }

  const totalTrips = tripLogs.length;
  const totalDistanceKm = roundToDecimals(
    tripLogs.reduce((sum, log) => sum + log.distanceKm, 0),
    2
  );
  const totalCo2SavedKg = roundToDecimals(
    tripLogs.reduce((sum, log) => sum + log.co2SavedKg, 0),
    4
  );
  const averageCo2PerTrip = roundToDecimals(totalCo2SavedKg / totalTrips, 4);

  return {
    totalTrips,
    totalDistanceKm,
    totalCo2SavedKg,
    averageCo2PerTrip,
  };
}

// ============================================================
// Internal helpers
// ============================================================

function validateInput(input: EsgCalculationInput): void {
  if (input.distanceKm < 0) {
    throw new Error(
      `Invalid distanceKm: ${input.distanceKm}. Distance must be >= 0.`
    );
  }
  if (input.passengerCount < 0) {
    throw new Error(
      `Invalid passengerCount: ${input.passengerCount}. Passenger count must be >= 0.`
    );
  }
  if (!Number.isInteger(input.passengerCount)) {
    throw new Error(
      `Invalid passengerCount: ${input.passengerCount}. Passenger count must be an integer.`
    );
  }
  if (input.emissionFactorKgPerKm <= 0) {
    throw new Error(
      `Invalid emissionFactorKgPerKm: ${input.emissionFactorKgPerKm}. Emission factor must be > 0.`
    );
  }
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
