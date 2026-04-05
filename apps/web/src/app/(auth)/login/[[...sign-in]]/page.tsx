"use client";

import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import { APP_CONFIG } from "@/config/app";
import { Leaf } from "lucide-react";

/**
 * Login Landing Page — "Editorial Organicism" + Clerk Auth
 * Bevarer det originale brand-design med:
 *   - Full-bleed watercolor illustration som baggrund
 *   - Glassmorphism login-kort (højre side på desktop, centreret på mobil)
 *   - Project SHIFT logo + headline
 *   - Clerk SignIn komponent med custom appearance der matcher brand-paletten
 *   - Social logins håndteres af Clerk (Google, Microsoft)
 */
export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex items-center justify-center lg:justify-end overflow-hidden">
      {/* ── Full-bleed baggrunds-illustration ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/illustrations/login-hero.png"
          alt="Dansk landskab med samkørende kollegaer, vindmøller og grønne bakker"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
        />
        {/* Subtilt overlay for at sikre læsbarhed */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/30 lg:to-white/40" />
        {/* Bund-gradient der blander ind i baggrunden */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* ── Glassmorphism Login-kort ── */}
      <div className="relative z-10 w-full max-w-md mx-4 lg:mr-[8%] lg:ml-auto animate-fade-in">
        <div
          className="rounded-3xl p-8 lg:p-10 shadow-elevated"
          style={{
            background: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {/* ── Logo ── */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
              <Leaf size={24} strokeWidth={1.5} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 leading-tight tracking-tight">
                {APP_CONFIG.name.split(" ")[0]}
              </h2>
              <h2 className="text-xl font-bold text-primary-600 leading-tight tracking-tight -mt-0.5">
                {APP_CONFIG.name.split(" ")[1]}
              </h2>
            </div>
          </div>

          {/* ── Headline ── */}
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 text-center mb-8 leading-snug">
            Log ind på din
            <br />
            arbejdsplads.
          </h1>

          {/* ── Clerk SignIn Komponent ── */}
          <div className="clerk-signin-wrapper">
            <SignIn
              routing="path"
              path="/login"
              appearance={{
                elements: {
                  // Hovedcontainer
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "!bg-transparent !shadow-none !p-0 !m-0 w-full",
                  // Skjul Clerk's egen header (vi har vores egen)
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  // Form felter — matcher Editorial Organicism
                  formFieldInput:
                    "!rounded-2xl !h-13 !text-sm !text-neutral-900 !placeholder-neutral-400 !transition-all !duration-200 !outline-none focus:!ring-2 focus:!ring-primary-500/40 focus:!shadow-md",
                  formFieldLabel: "!text-sm !font-medium !text-neutral-700",
                  // CTA-knap — gradient orange
                  formButtonPrimary:
                    "!w-full !h-13 !rounded-full !bg-gradient-to-r !from-accent-500 !to-accent-600 !text-white !font-bold !text-sm !shadow-lg hover:!shadow-xl hover:!scale-[1.02] active:!scale-[0.98] !transition-all !duration-200 !border-none",
                  // Social buttons
                  socialButtonsBlockButton:
                    "!h-12 !rounded-2xl !shadow-sm hover:!shadow-md hover:!scale-105 active:!scale-95 !transition-all !duration-200",
                  socialButtonsBlockButtonText: "!text-sm !font-medium",
                  // Divider
                  dividerLine: "!bg-neutral-200",
                  dividerText: "!text-xs !text-neutral-400 !font-medium",
                  // Footer
                  footer: "hidden",
                  footerAction: "hidden",
                  // Links
                  formFieldAction:
                    "!text-sm !text-neutral-600 hover:!text-primary-600 !underline !underline-offset-2 !transition-colors",
                  // Branding
                  internal: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  showOptionalFields: false,
                },
              }}
            />
          </div>

          {/* ── Tagline ── */}
          <p className="text-center text-[10px] text-neutral-400 mt-8 leading-relaxed">
            {APP_CONFIG.tagline}
          </p>
        </div>
      </div>

      {/* ── Bund-badge (On mobile) ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 lg:bottom-6 lg:left-6 lg:translate-x-0">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-neutral-700"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <Leaf size={14} className="text-primary-600" />
          {APP_CONFIG.description.slice(0, 50)}…
        </div>
      </div>
    </div>
  );
}
