// NestJS entry point
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { envConfig } from "./common/config/env.validation";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    credentials: true,
  });

  // Global prefix for all API routes
  app.setGlobalPrefix("api/v1");

  const port = envConfig.API_PORT;
  await app.listen(port);
  console.log(`[API] Project SHIFT API running on port ${port}`);
}

bootstrap();
