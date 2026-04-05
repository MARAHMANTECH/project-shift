// Environment variable validation using Zod
// Validates all required env vars at startup - fail fast if missing

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith("postgresql://"),

  // API
  API_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Clerk Auth (optional in development - DevAuthGuard used instead)
  CLERK_SECRET_KEY: z.string().optional().transform((v) => v || undefined),
  CLERK_WEBHOOK_SECRET: z.string().optional().transform((v) => v || undefined),

  // Frontend URL (for CORS)
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),

  // ESG Configuration
  ESG_EMISSION_FACTOR_KG_PER_KM: z.coerce.number().positive().default(0.12),
  ESG_FORMULA_VERSION: z.string().default("v1.0"),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      console.error(
        `[ENV] Environment validation failed:\n${missing}\n\nSee .env.example for required variables.`
      );
    }
    process.exit(1);
  }
}

export const envConfig = validateEnv();
