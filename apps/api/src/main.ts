// NestJS entry point
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { envConfig } from "./common/config/env.validation";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  const port = envConfig.API_PORT;
  await app.listen(port);
  console.log(`[API] Project SHIFT API running on port ${port}`);
}

bootstrap();
