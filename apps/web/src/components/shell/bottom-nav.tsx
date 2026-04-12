"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Car, Leaf, Users, ScrollText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", id: "nav-dashboard" },
  { href: "/rides", icon: Car, label: "Køreture", id: "nav-rides" },
  { href: "/esg", icon: Leaf, label: "ESG", id: "nav-esg" },
  { href: "/community", icon: Users, label: "Fællesskab", id: "nav-community" },
  { href: "/changelog", icon: ScrollText, label: "Historik", id: "nav-changelog" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        lg:hidden
        glass shadow-[0_-4px_20px_rgba(28,28,25,0.06)]
        pb-[env(safe-area-inset-bottom)]
      "
      role="navigation"
      aria-label="Hovednavigation"
    >
      <div className="flex items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              id={item.id}
              href={item.href}
              className={`
                touch-target flex flex-col items-center justify-center
                gap-1 py-2.5 px-3 rounded-2xl relative
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-primary-50 dark:bg-primary-900/20 animate-scale-in" />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={`relative z-10 transition-transform duration-200 ${isActive ? "scale-105" : ""}`}
              />
              <span className={`relative z-10 text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
