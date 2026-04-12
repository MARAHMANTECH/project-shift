import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { APP_CONFIG } from "@/config/app";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthTokenProvider } from "@/components/providers/auth-token-provider";
import "@/styles/globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.name,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F2ED" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0B09" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="da" className={bricolage.variable} suppressHydrationWarning>
        <body className="font-sans">
          <QueryProvider>
            <AuthTokenProvider>{children}</AuthTokenProvider>
          </QueryProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
