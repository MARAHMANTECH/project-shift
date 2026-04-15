"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col justify-center items-center p-4">
      {/* Dekorativ baggrund */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-accent-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Ikon container */}
        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 bg-white/60 backdrop-blur-xl rounded-full shadow-lg shadow-black/5 flex items-center justify-center border border-white/40">
            <ShieldAlert className="h-10 w-10 text-[#2D5A27]" />
          </div>
        </div>

        {/* Info kort */}
        <div className="bg-white/70 backdrop-blur-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] rounded-[24px] overflow-hidden text-center">
          
          <div className="h-2 bg-[#2D5A27] w-full" />
          
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-2 text-slate-800" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              Adgang Nægtet
            </h1>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Det ser ud til, at din profil mangler den nødvendige adgangsgruppe for at benytte Project SHIFT.
            </p>
            
            <div className="bg-[#f0ede8]/50 rounded-2xl p-4 mb-8 text-left">
              <h3 className="text-sm font-medium text-slate-800 mb-1">Hvad skal jeg gøre?</h3>
              <p className="text-sm text-slate-600">
                Kontakt venligst jeres interne IT-support og anmod om at blive tilføjet til sikkerhedsgruppen for Project SHIFT kørsel.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full bg-[#2D5A27] hover:bg-[#23471e] text-white rounded-full min-h-[44px] shadow-md shadow-[#2D5A27]/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <LogOut className="h-4 w-4" />
                Log ud af kontoen
              </Button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full text-sm text-slate-500 hover:text-slate-800 font-medium py-2 transition-colors flex justify-center items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Gå tilbage
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">Project SHIFT Enterprise Identity</p>
        </div>

      </div>
    </div>
  );
}
