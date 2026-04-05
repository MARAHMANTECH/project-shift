import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Super Admin | ${APP_CONFIG.name}`,
  description: "Administration af organisationer og integrationer",
};

/**
 * Admin Layout — distinct Super Admin shell
 * Adskilt fra det normale dashboard med Forest Green tema
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
