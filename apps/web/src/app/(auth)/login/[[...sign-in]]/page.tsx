// Login Landing Page — ENVO IT-inspireret minimalisme × SoulEx æstetik
// Én enkelt Microsoft SSO-knap, ingen email/password felter
// Skjult credentials-fallback kan aktiveres via ENABLE_CREDENTIALS_LOGIN env

"use client";

import { signIn } from "next-auth/react";
import { Leaf, Shield, ArrowRight, KeyRound } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

/** Microsoft Windows-logo som SVG */
function MicrosoftLogo({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="9.5" height="9.5" fill="#F25022" />
      <rect x="11.5" y="0" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="0" y="11.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="11.5" y="11.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  );
}

export default function LoginPage(): React.ReactElement {
  const showCredentials = process.env.NEXT_PUBLIC_ENABLE_CREDENTIALS_LOGIN === "true";

  function handleMicrosoftLogin(): void {
    signIn("microsoft-entra-id", { callbackUrl: "/" });
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(180deg, #F5F2ED 0%, #F0EDE8 50%, #EBE8E3 100%)",
      }}
    >
      {/* Logo + Produktnavn */}
      <div className="flex items-center gap-3 mb-4 animate-fade-in">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
          <Leaf size={24} strokeWidth={1.5} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 leading-tight tracking-tight">
            {APP_CONFIG.name.split(" ")[0]}
          </h2>
          <h2 className="text-xl font-bold text-primary-600 leading-tight tracking-tight -mt-0.5 italic">
            {APP_CONFIG.name.split(" ")[1]}
          </h2>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-neutral-400 mb-10 text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
        {APP_CONFIG.description}
      </p>

      {/* Login-kort */}
      <div
        className="
          w-full max-w-sm
          bg-white/90 backdrop-blur-lg
          rounded-3xl
          p-8
          shadow-[0_4px_24px_rgba(28,28,25,0.08)]
          animate-fade-in-up
        "
        style={{ animationDelay: "150ms" }}
      >
        {/* Header med shield */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-primary-50 flex items-center justify-center">
            <Shield size={20} strokeWidth={1.5} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Log ind</h1>
            <p className="text-sm text-neutral-400">Med din Microsoft-konto</p>
          </div>
        </div>

        {/* Microsoft SSO Knap */}
        <button
          id="login-microsoft-btn"
          onClick={handleMicrosoftLogin}
          className="
            w-full flex items-center justify-center gap-3
            mt-6 px-6 py-4
            rounded-2xl
            bg-gradient-to-r from-primary-500 to-primary-600
            text-white font-semibold text-sm
            shadow-lg
            hover:shadow-xl hover:scale-[1.02]
            active:scale-[0.98]
            transition-all duration-200
            cursor-pointer
            group
          "
        >
          <MicrosoftLogo className="h-5 w-5" />
          <span>Log ind med Microsoft</span>
          <ArrowRight
            size={18}
            strokeWidth={2}
            className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
          />
        </button>

        {/* Hjælpetekst */}
        <p className="text-xs text-neutral-400 text-center mt-4">
          Brug din arbejds- eller skole-konto
        </p>

        {/* Skjult credentials-fallback */}
        {showCredentials && (
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <button
              id="login-credentials-toggle"
              onClick={() => signIn("credentials")}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-xl
                bg-neutral-50 text-neutral-500
                text-sm font-medium
                hover:bg-neutral-100 hover:text-neutral-700
                transition-all duration-200
                cursor-pointer
              "
            >
              <KeyRound size={16} strokeWidth={1.5} />
              Log ind med email
            </button>
          </div>
        )}
      </div>

      {/* Support-link */}
      <p className="text-xs text-neutral-400 mt-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
        Brug for hjælp?{" "}
        <a
          href="mailto:support@projectshift.dk"
          className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
        >
          Kontakt support
        </a>
      </p>
    </div>
  );
}
