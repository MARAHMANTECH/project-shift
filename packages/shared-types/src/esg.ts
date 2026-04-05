// ESG domain types

export interface EsgTripLogDto {
  id: string;
  rideId: string;
  distanceKm: number;
  passengerCount: number;
  co2SavedKg: number;
  emissionFactor: number;
  calculatedAt: string;
  formulaVersion: string;
}

export interface EsgCalculationInput {
  distanceKm: number;
  passengerCount: number;
  emissionFactorKgPerKm: number;
}

export interface EsgCalculationResult {
  co2SavedKg: number;
  totalOccupants: number;
  formulaVersion: string;
}

export interface EsgOrgSummary {
  organizationId: string;
  totalTrips: number;
  totalDistanceKm: number;
  totalCo2SavedKg: number;
  averageCo2PerTrip: number;
  periodStart: string;
  periodEnd: string;
}
