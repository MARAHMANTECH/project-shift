// Central ESG constants - NEVER hardcode these values elsewhere
// See ARCHITECTURE.md for formula documentation

import type { EsgConfig } from "./types";

/**
 * Emission factors by vehicle type (kg CO2 per km)
 * Source: Danish Energy Agency / Energistyrelsen, 2025 data
 */
export const EMISSION_FACTORS = {
  /** Average Danish passenger car (petrol/diesel mix) */
  AVERAGE_CAR: 0.12,
  /** Electric vehicle (Danish grid mix) */
  ELECTRIC_CAR: 0.03,
  /** Diesel vehicle */
  DIESEL_CAR: 0.14,
  /** Petrol vehicle */
  PETROL_CAR: 0.12,
  /** Hybrid vehicle */
  HYBRID_CAR: 0.08,
} as const;

/**
 * Default ESG configuration used when no override is specified
 */
export const ESG_DEFAULTS: EsgConfig = {
  emissionFactorKgPerKm: EMISSION_FACTORS.AVERAGE_CAR,
  formulaVersion: "v1.0",
} as const;

/**
 * Minimum occupants required for CO2 savings calculation.
 * A solo driver (1 occupant) generates no savings.
 */
export const MIN_OCCUPANTS_FOR_SAVINGS = 2;
