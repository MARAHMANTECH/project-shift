// ESG calculator pure function - delegates to @project-shift/esg-core
// This file exists in the API layer for NestJS DI integration

import { calculateCo2Savings } from "@project-shift/esg-core";
import type { EsgCalculationInput, EsgCalculationResult } from "@project-shift/shared-types";

/**
 * Re-exported pure function for use in NestJS services.
 * The actual implementation lives in packages/esg-core for testability.
 */
export function calculateTripCo2Savings(input: EsgCalculationInput): EsgCalculationResult {
  return calculateCo2Savings(input);
}
