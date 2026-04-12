-- CreateEnum
CREATE TYPE "SsoProvider" AS ENUM ('ENTRA_ID', 'GOOGLE_WORKSPACE', 'CUSTOM_SAML', 'CUSTOM_OIDC');

-- CreateEnum
CREATE TYPE "SsoConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'DISABLED', 'ERROR');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('CANTEEN_MENU_SYNC', 'DELIVERY_WOLT', 'SPORT_WANNASPORT', 'CUSTOM_WEBHOOK');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'ERROR', 'SYNCING');

-- CreateEnum
CREATE TYPE "LicenseTier" AS ENUM ('TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ChangelogType" AS ENUM ('FEATURE', 'FIX', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_BUILD', 'DONE');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModuleType" ADD VALUE 'CANTEEN';
ALTER TYPE "ModuleType" ADD VALUE 'DELIVERY';
ALTER TYPE "ModuleType" ADD VALUE 'SPORT';

-- CreateTable
CREATE TABLE "sso_connections" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "provider" "SsoProvider" NOT NULL,
    "clerk_connection_id" TEXT,
    "external_provider_id" TEXT,
    "domains" TEXT[],
    "status" "SsoConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configurations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "integration_type" "IntegrationType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" "IntegrationStatus" NOT NULL DEFAULT 'INACTIVE',
    "last_sync_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_event_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "integration_type" "IntegrationType" NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_licenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "tier" "LicenseTier" NOT NULL DEFAULT 'TRIAL',
    "max_users" INTEGER NOT NULL DEFAULT 50,
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelogs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "version_build" INTEGER NOT NULL,
    "type" "ChangelogType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "changelog_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sso_connections_clerk_connection_id_key" ON "sso_connections"("clerk_connection_id");

-- CreateIndex
CREATE INDEX "sso_connections_organization_id_idx" ON "sso_connections"("organization_id");

-- CreateIndex
CREATE INDEX "integration_configurations_organization_id_idx" ON "integration_configurations"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configurations_organization_id_integration_type_key" ON "integration_configurations"("organization_id", "integration_type");

-- CreateIndex
CREATE INDEX "webhook_event_logs_organization_id_idx" ON "webhook_event_logs"("organization_id");

-- CreateIndex
CREATE INDEX "webhook_event_logs_organization_id_integration_type_idx" ON "webhook_event_logs"("organization_id", "integration_type");

-- CreateIndex
CREATE INDEX "webhook_event_logs_created_at_idx" ON "webhook_event_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "organization_licenses_organization_id_key" ON "organization_licenses"("organization_id");

-- CreateIndex
CREATE INDEX "changelogs_version_build_idx" ON "changelogs"("version_build");

-- CreateIndex
CREATE INDEX "changelogs_type_idx" ON "changelogs"("type");

-- CreateIndex
CREATE INDEX "changelogs_published_at_idx" ON "changelogs"("published_at");

-- CreateIndex
CREATE INDEX "feedback_organization_id_idx" ON "feedback"("organization_id");

-- CreateIndex
CREATE INDEX "feedback_organization_id_status_idx" ON "feedback"("organization_id", "status");

-- CreateIndex
CREATE INDEX "feedback_user_id_idx" ON "feedback"("user_id");

-- CreateIndex
CREATE INDEX "feedback_status_idx" ON "feedback"("status");

-- AddForeignKey
ALTER TABLE "sso_connections" ADD CONSTRAINT "sso_connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_configurations" ADD CONSTRAINT "integration_configurations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_licenses" ADD CONSTRAINT "organization_licenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
