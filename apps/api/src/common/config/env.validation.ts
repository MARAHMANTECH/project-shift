// Environment variable validation using Zod
// Validates all required env vars at startup - fail fast if missing
// Supports Railway deployment ($PORT), lokal udvikling ($API_PORT)

import { z } from "zod";

const envSchema = z.object({
  // Database — tillad både postgresql:// og postgres:// (Railway bruger postgres://)
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL er påkrævet")
    .refine(
      (url) => url.startsWith("postgresql://") || url.startsWith("postgres://"),
      "DATABASE_URL skal starte med postgresql:// eller postgres://"
    ),

  // API Port — Railway injecter $PORT, lokal dev bruger $API_PORT
  PORT: z.coerce.number().int().positive().optional(),
  API_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // NextAuth.js JWT Secret (optional i development — DevAuthGuard bruges i stedet)
  NEXTAUTH_SECRET: z
    .string()
    .optional()
    .transform((v) => v || undefined),

  // Frontend URL (for CORS)
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),

  // ESG Configuration
  ESG_EMISSION_FACTOR_KG_PER_KM: z.coerce.number().positive().default(0.12),
  ESG_FORMULA_VERSION: z.string().default("v1.0"),
});

export type EnvConfig = z.infer<typeof envSchema> & {
  /** Effektiv port — Railway $PORT har prioritet over $API_PORT */
  readonly EFFECTIVE_PORT: number;
};

function validateEnv(): EnvConfig {
  try {
    const parsed = envSchema.parse(process.env);

    // Railway injecter $PORT — det har altid prioritet
    const effectivePort = parsed.PORT ?? parsed.API_PORT;

    return {
      ...parsed,
      EFFECTIVE_PORT: effectivePort,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      console.error(
        `[ENV] ❌ Environment validation fejlede:\n${missing}\n\n` +
          `Se .env.example for påkrævede variabler.\n` +
          `Railway: Sørg for at DATABASE_URL er sat som service variable.`
      );
    }
    process.exit(1);
  }
}

export const envConfig = validateEnv();
