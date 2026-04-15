"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  Plug,
  Leaf,
  Shield,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin/super", label: "Oversigt", icon: BarChart3 },
  { href: "/admin/super/tenants", label: "Organisationer", icon: Building2 },
  { href: "/admin/super/integrations", label: "Integrationer", icon: Plug },
  { href: "/admin/super/esg", label: "ESG-overblik", icon: Leaf },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex" style={{ background: "var(--color-surface-base)" }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 z-40"
        style={{
          background: "linear-gradient(180deg, #1B3726 0%, #0E1F15 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/90">Super Admin</p>
            <p className="text-xs text-white/50">
              {session?.user?.email ?? "Admin"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin/super"
                ? pathname === "/admin/super"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/15"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to Dashboard */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <ArrowLeft size={16} />
            Tilbage til Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        {/* Mobile Header */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{
            background: "rgba(27, 55, 38, 0.95)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            <span className="text-white text-sm font-bold">Super Admin</span>
          </div>
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white"
          >
            ← Dashboard
          </Link>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
