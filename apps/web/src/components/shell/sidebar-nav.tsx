"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { APP_CONFIG } from "@/config/app";
import { LayoutDashboard, Car, Search, PlusCircle, Leaf, Users, ScrollText, Shield, LogOut } from "lucide-react";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Hjem", id: "sidebar-dashboard" },
  { href: "/rides", icon: Car, label: "Køreture", id: "sidebar-rides" },
  { href: "/rides/search", icon: Search, label: "Find tur", id: "sidebar-search" },
  { href: "/rides/new", icon: PlusCircle, label: "Opret tur", id: "sidebar-new-ride" },
  { href: "/esg", icon: Leaf, label: "ESG Rapport", id: "sidebar-esg" },
  { href: "/community", icon: Users, label: "Fællesskab", id: "sidebar-community" },
  { href: "/changelog", icon: ScrollText, label: "Historik", id: "sidebar-changelog" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setIsSuperAdmin(data.role === "SUPER_ADMIN"))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  return (
    <aside
      className="
        hidden lg:flex lg:flex-col
        w-64 h-screen fixed left-0 top-0
        glass
        z-40
      "
      role="navigation"
      aria-label="Sidebjælke"
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-forest text-white font-bold text-lg shadow-md">
            S
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--foreground)]">
              {APP_CONFIG.name}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
              Samkørsel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href) && item.href !== "/";

          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              id={item.id}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-2xl
                text-sm font-medium
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? "surface-lowest text-primary-700 dark:text-primary-400 shadow-sm font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:surface-container"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Super Admin — kun synlig for SUPER_ADMIN */}
      {isSuperAdmin && (
        <div className="px-4 pb-2">
          <Link
            id="sidebar-super-admin"
            href="/admin/super"
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-2xl
              text-sm font-medium
              transition-all duration-200 ease-out
              ${
                pathname.startsWith("/admin/super")
                  ? "bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:surface-container"
              }
            `}
          >
            <Shield size={20} strokeWidth={pathname.startsWith("/admin/super") ? 2 : 1.5} />
            <span>Super Admin</span>
            {pathname.startsWith("/admin/super") && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600" />
            )}
          </Link>
        </div>
      )}

      {/* Bruger + Log ud */}
      <div className="p-4 space-y-2">
        <UserMenu />
        <button
          id="sidebar-logout-btn"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl
            text-sm font-medium
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/10
            transition-all duration-200 ease-out
            cursor-pointer
          "
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Log ud</span>
        </button>
      </div>
    </aside>
  );
}
