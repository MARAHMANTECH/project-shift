import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Log ind | ${APP_CONFIG.name}`,
  description: `Log ind på ${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
};

/**
 * Auth Layout — intet shell/sidebar, bare ren baggrund
 * Bruges til login, glemt-adgangskode, osv.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
