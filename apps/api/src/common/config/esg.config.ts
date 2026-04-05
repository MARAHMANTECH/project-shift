// Central ESG configuration - NEVER hardcode emission factors elsewhere
// See ARCHITECTURE.md for formula documentation

import { envConfig } from "../../common/config/env.validation";
import type { EsgConfig } from "@project-shift/esg-core";

export const esgConfig: EsgConfig = {
  emissionFactorKgPerKm: envConfig.ESG_EMISSION_FACTOR_KG_PER_KM,
  formulaVersion: envConfig.ESG_FORMULA_VERSION,
};
