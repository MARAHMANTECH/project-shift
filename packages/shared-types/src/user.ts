// User domain types

export type UserRole = "MEMBER" | "ORG_ADMIN" | "SUPER_ADMIN";

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  externalAuthId: string;
}
