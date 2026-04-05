"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { APP_CONFIG } from "@/config/app";
import { LayoutDashboard, Car, Search, PlusCircle, Leaf, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Hjem", id: "sidebar-dashboard" },
  { href: "/rides", icon: Car, label: "Køreture", id: "sidebar-rides" },
  { href: "/rides/search", icon: Search, label: "Find tur", id: "sidebar-search" },
  { href: "/rides/new", icon: PlusCircle, label: "Opret tur", id: "sidebar-new-ride" },
  { href: "/esg", icon: Leaf, label: "ESG Rapport", id: "sidebar-esg" },
  { href: "/community", icon: Users, label: "Fællesskab", id: "sidebar-community" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();

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
      {/* Logo — No-Line Rule: ingen border-bottom, tonal adskillelse */}
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

      {/* Navigation — ingen borders, tonal active state */}
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
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section — Clerk UserButton med brugerdata */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:surface-container transition-all duration-200">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
              {user?.firstName ?? ""} {user?.lastName ?? ""}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

