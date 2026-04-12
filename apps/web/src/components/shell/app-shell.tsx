"use client";

import { type ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { Leaf } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Main content area */}
      <main className="lg:ml-64 pb-24 lg:pb-0">
        {/* Mobile header — glassmorphism, No-Line Rule */}
        <header className="lg:hidden sticky top-0 z-30 glass shadow-[var(--shadow-card)] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl gradient-forest text-white flex items-center justify-center shadow-sm">
                <Leaf size={18} strokeWidth={2} />
              </div>
              <span className="font-bold text-sm text-[var(--foreground)]">
                Project SHIFT
              </span>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
