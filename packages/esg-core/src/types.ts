// ESG configuration types

export interface EsgConfig {
  /** Emission factor in kg CO2 per km for average vehicle */
  emissionFactorKgPerKm: number;
  /** Formula version identifier */
  formulaVersion: string;
}
