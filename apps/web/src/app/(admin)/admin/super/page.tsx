"use client";

// Super Admin Dashboard — Tenant Overview
// Dark Forest Green theme for distinct admin experience

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Building2,
  Users,
  Plug,
  Leaf,
  Plus,
  Search,
  ChevronRight,
  Shield,
  BarChart3,
  Settings,
} from "lucide-react";

interface TenantOverview {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  deletedAt: string | null;
  userCount: number;
  rideCount: number;
  license: {
    tier: string;
    maxUsers: number;
    expiresAt: string | null;
  } | null;
  enabledModules: string[];
  activeSsoConnections: number;
  activeIntegrations: number;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const navItems = [
    { href: "/admin/super", label: "Oversigt", icon: BarChart3 },
    { href: "/admin/super/tenants", label: "Organisationer", icon: Building2 },
    { href: "/admin/super/integrations", label: "Integrationer", icon: Plug },
    { href: "/admin/super/esg", label: "ESG-overblik", icon: Leaf },
  ];

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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Back to Dashboard */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <Settings size={16} />
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
            href="/dashboard"
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

export default function SuperAdminDashboard() {
  const { data: adminSession } = useSession();
  const [tenants, setTenants] = useState<TenantOverview[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTenants() {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/tenants`,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Kunne ikke hente organisationer");
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukendt fejl");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const tierColors: Record<string, string> = {
    TRIAL: "bg-amber-100 text-amber-700",
    STARTER: "bg-blue-100 text-blue-700",
    PROFESSIONAL: "bg-purple-100 text-purple-700",
    ENTERPRISE: "bg-emerald-100 text-emerald-700",
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Organisationer
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Administrér {tenants.length} organisationer på platformen
          </p>
        </div>
        <Link
          href="/admin/super/tenants/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))",
          }}
        >
          <Plus size={16} />
          Opret organisation
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-tertiary)" }}
        />
        <input
          type="text"
          placeholder="Søg organisationer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none transition-all focus:ring-2"
          style={{
            background: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Aktive organisationer",
            value: tenants.filter((t) => !t.deletedAt).length,
            icon: Building2,
            color: "var(--color-primary-600)",
          },
          {
            label: "Brugere i alt",
            value: tenants.reduce((sum, t) => sum + t.userCount, 0),
            icon: Users,
            color: "var(--color-accent-500)",
          },
          {
            label: "Aktive SSO",
            value: tenants.reduce((sum, t) => sum + t.activeSsoConnections, 0),
            icon: Shield,
            color: "#7C3AED",
          },
          {
            label: "Integrationer",
            value: tenants.reduce((sum, t) => sum + t.activeIntegrations, 0),
            icon: Plug,
            color: "#0EA5E9",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl"
            style={{
              background: "var(--color-surface-elevated)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tenant List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: "var(--color-surface-elevated)" }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="text-center py-12 rounded-2xl"
          style={{ background: "var(--color-surface-elevated)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-danger-500)" }}>
            {error}
          </p>
          <button
            onClick={fetchTenants}
            className="mt-3 text-sm underline"
            style={{ color: "var(--color-primary-600)" }}
          >
            Prøv igen
          </button>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div
          className="text-center py-12 rounded-2xl"
          style={{ background: "var(--color-surface-elevated)" }}
        >
          <Building2 size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            {search
              ? `Ingen organisationer matcher "${search}"`
              : "Ingen organisationer endnu"}
          </p>
          {!search && (
            <Link
              href="/admin/super/tenants/new"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium underline"
              style={{ color: "var(--color-primary-600)" }}
            >
              <Plus size={14} /> Opret den første
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/admin/super/tenants/${tenant.id}`}
              className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl group hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              style={{
                background: "var(--color-surface-elevated)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Avatar */}
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))`,
                  color: "var(--color-primary-700)",
                }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="font-bold text-sm truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {tenant.name}
                  </h3>
                  {tenant.license && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tierColors[tenant.license.tier] ?? ""
                      }`}
                    >
                      {tenant.license.tier}
                    </span>
                  )}
                  {tenant.deletedAt && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                      SLETTET
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {tenant.slug} · {tenant.userCount} brugere ·{" "}
                  {tenant.rideCount} ture
                </p>
              </div>

              {/* Modules */}
              <div className="hidden lg:flex items-center gap-1">
                {tenant.enabledModules.slice(0, 3).map((mod) => (
                  <span
                    key={mod}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium"
                    style={{
                      background: "var(--color-primary-50)",
                      color: "var(--color-primary-600)",
                    }}
                  >
                    {mod.replace("_", " ")}
                  </span>
                ))}
                {tenant.enabledModules.length > 3 && (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    +{tenant.enabledModules.length - 3}
                  </span>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight
                size={18}
                className="flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
