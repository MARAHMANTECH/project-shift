// NestJS entry point — Project SHIFT API
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { envConfig } from "./common/config/env.validation";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Nødvendig for Svix webhook signatur-verifikation
  });

  // Enable CORS for frontend — understøtter Railway + lokal udvikling
  const allowedOrigins: (string | RegExp)[] = [
    process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    /\.railway\.app$/,  // Alle Railway subdomæner
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Global prefix for all API routes
  app.setGlobalPrefix("api/v1");

  // Brug EFFECTIVE_PORT — Railway $PORT har prioritet over $API_PORT
  const port = envConfig.EFFECTIVE_PORT;
  await app.listen(port);

  console.log(`[API] ✅ Project SHIFT API kører`);
  console.log(`[API]    Port: ${port}`);
  console.log(`[API]    Env:  ${envConfig.NODE_ENV}`);
  console.log(`[API]    Health: http://0.0.0.0:${port}/api/v1/health`);
}

bootstrap();

