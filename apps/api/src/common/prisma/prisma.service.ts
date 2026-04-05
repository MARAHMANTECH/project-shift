// Prisma service - injectable database client
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log("[PRISMA] Connected to database");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log("[PRISMA] Disconnected from database");
  }
}
