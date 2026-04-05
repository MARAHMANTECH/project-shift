// Clerk Webhook Service
// Handles Clerk webhook events: user lifecycle, organization sync
// All operations are idempotent to handle webhook retries safely

import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

interface ClerkUserData {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: Record<string, unknown>;
}

interface ClerkOrgData {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface ClerkOrgMembershipData {
  organization: { id: string; slug: string };
  public_user_data: { user_id: string };
  role: string;
}

@Injectable()
export class ClerkWebhookService {
  private readonly logger = new Logger(ClerkWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleUserCreated(data: ClerkUserData): Promise<void> {
    const email = data.email_addresses?.[0]?.email_address;
    if (!email) {
      this.logger.warn(`user.created: No email for ${data.id}`);
      return;
    }

    // Idempotent: check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { externalAuthId: data.id },
    });

    if (existing) {
      this.logger.log(`user.created: User ${email} already exists, skipping`);
      return;
    }

    // Find organization by email domain
    const domain = email.split("@")[1];
    const emailDomain = await this.prisma.emailDomain.findFirst({
      where: { domain, isVerified: true },
    });

    if (!emailDomain) {
      this.logger.warn(
        `user.created: No verified domain for ${domain}, user ${email} not provisioned`
      );
      return;
    }

    // Resolve role from Clerk publicMetadata
    const metadataRole = data.public_metadata?.role as string | undefined;
    const role =
      metadataRole === "SUPER_ADMIN"
        ? "SUPER_ADMIN"
        : metadataRole === "ORG_ADMIN"
          ? "ORG_ADMIN"
          : "MEMBER";

    const user = await this.prisma.user.create({
      data: {
        externalAuthId: data.id,
        email,
        firstName: data.first_name ?? "Ukendt",
        lastName: data.last_name ?? "",
        avatarUrl: data.image_url,
        role: role as "MEMBER" | "ORG_ADMIN" | "SUPER_ADMIN",
        organizationId: emailDomain.organizationId,
      },
    });

    await this.logAudit(
      emailDomain.organizationId,
      user.id,
      "USER_CREATED_VIA_WEBHOOK",
      "User",
      user.id
    );

    this.logger.log(
      `user.created: Provisioned ${email} in org ${emailDomain.organizationId}`
    );
  }

  async handleUserUpdated(data: ClerkUserData): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { externalAuthId: data.id },
    });

    if (!existing) {
      this.logger.warn(`user.updated: User ${data.id} not found in DB`);
      return;
    }

    const email = data.email_addresses?.[0]?.email_address;

    await this.prisma.user.update({
      where: { externalAuthId: data.id },
      data: {
        firstName: data.first_name ?? existing.firstName,
        lastName: data.last_name ?? existing.lastName,
        avatarUrl: data.image_url ?? existing.avatarUrl,
        email: email ?? existing.email,
      },
    });

    await this.logAudit(
      existing.organizationId,
      existing.id,
      "USER_UPDATED_VIA_WEBHOOK",
      "User",
      existing.id
    );

    this.logger.log(`user.updated: Updated user ${data.id}`);
  }

  async handleUserDeleted(data: { id: string }): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { externalAuthId: data.id },
    });

    if (!existing) {
      this.logger.warn(`user.deleted: User ${data.id} not found in DB`);
      return;
    }

    // Soft-delete per governance rules
    await this.prisma.user.update({
      where: { externalAuthId: data.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await this.logAudit(
      existing.organizationId,
      existing.id,
      "USER_SOFT_DELETED_VIA_WEBHOOK",
      "User",
      existing.id
    );

    this.logger.log(`user.deleted: Soft-deleted user ${data.id}`);
  }

  async handleOrganizationCreated(data: ClerkOrgData): Promise<void> {
    // Idempotent: check if org exists
    const existing = await this.prisma.organization.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      this.logger.log(
        `organization.created: Org ${data.slug} already exists, skipping`
      );
      return;
    }

    const org = await this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.image_url,
      },
    });

    // Create default license (TRIAL)
    await this.prisma.organizationLicense.create({
      data: {
        organizationId: org.id,
        tier: "TRIAL",
        maxUsers: 50,
      },
    });

    // Enable default modules
    await this.prisma.orgModule.createMany({
      data: [
        { organizationId: org.id, module: "RIDESHARING" },
        { organizationId: org.id, module: "ESG_DASHBOARD" },
        { organizationId: org.id, module: "COMMUNITY" },
      ],
    });

    this.logger.log(
      `organization.created: Created org ${data.slug} with TRIAL license`
    );
  }

  async handleOrgMembershipCreated(
    data: ClerkOrgMembershipData
  ): Promise<void> {
    const clerkUserId = data.public_user_data.user_id;

    const user = await this.prisma.user.findUnique({
      where: { externalAuthId: clerkUserId },
    });

    if (!user) {
      this.logger.warn(
        `orgMembership.created: User ${clerkUserId} not found in DB`
      );
      return;
    }

    // Find org by Clerk slug
    const org = await this.prisma.organization.findFirst({
      where: { slug: data.organization.slug, deletedAt: null },
    });

    if (!org) {
      this.logger.warn(
        `orgMembership.created: Org ${data.organization.slug} not found`
      );
      return;
    }

    // Update user's organization
    await this.prisma.user.update({
      where: { id: user.id },
      data: { organizationId: org.id },
    });

    this.logger.log(
      `orgMembership.created: Linked user ${clerkUserId} to org ${org.slug}`
    );
  }

  async handleOrgMembershipDeleted(
    data: ClerkOrgMembershipData
  ): Promise<void> {
    const clerkUserId = data.public_user_data.user_id;

    const user = await this.prisma.user.findUnique({
      where: { externalAuthId: clerkUserId },
    });

    if (!user) return;

    // Deactivate user when removed from org
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    await this.logAudit(
      user.organizationId,
      user.id,
      "USER_DEACTIVATED_ORG_MEMBERSHIP_REMOVED",
      "User",
      user.id
    );

    this.logger.log(
      `orgMembership.deleted: Deactivated user ${clerkUserId}`
    );
  }

  private async logAudit(
    organizationId: string,
    userId: string,
    action: string,
    entity: string,
    entityId: string
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: { organizationId, userId, action, entity, entityId },
      });
    } catch (error) {
      this.logger.error(
        `Audit log failed: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  }
}
