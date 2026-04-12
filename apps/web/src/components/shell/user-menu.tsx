// UserMenu — Custom bruger-menu med avatar, navn og logout
// SoulEx Design: Pill-shaped, tonal surfaces, ambient shadows
// Viser avatar, navn, email, rolle + logout knap

"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronDown, User } from "lucide-react";

export function UserMenu(): React.ReactElement | null {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Luk menu ved klik udenfor
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const initials = `${session.user.name?.split(" ")[0]?.[0] ?? ""}${session.user.name?.split(" ")[1]?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        id="user-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2.5 px-3 py-2
          rounded-2xl
          hover:bg-[var(--color-surface-container)]
          transition-all duration-200
          cursor-pointer
        "
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "Bruger"}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-500/20"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white">
            {initials || <User size={14} />}
          </div>
        )}
        <div className="hidden lg:block text-left">
          <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">
            {session.user.name}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
            {session.user.email}
          </p>
        </div>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`hidden lg:block text-[var(--muted-foreground)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="
          absolute bottom-full left-0 right-0 mb-2
          lg:bottom-auto lg:top-full lg:mt-2 lg:right-0 lg:left-auto
          min-w-[220px]
          bg-white/95 backdrop-blur-lg
          rounded-2xl
          shadow-[0_8px_32px_rgba(28,28,25,0.12)]
          p-2
          animate-scale-in
          z-50
        ">
          {/* Bruger-info */}
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-bold text-[var(--foreground)]">{session.user.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{session.user.email}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-100 mx-2 my-1" />

          {/* Logout */}
          <button
            id="user-logout-btn"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="
              w-full flex items-center gap-2.5 px-3 py-2.5
              rounded-xl
              text-sm text-error font-medium
              hover:bg-error/5
              transition-all duration-200
              cursor-pointer
            "
          >
            <LogOut size={16} strokeWidth={1.5} />
            Log ud
          </button>
        </div>
      )}
    </div>
  );
}
