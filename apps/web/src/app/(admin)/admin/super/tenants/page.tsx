"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Building2,
  Users,
  Search,
  Plus,
  ChevronRight,
  Shield,
  BarChart3,
  Settings,
  Plug,
  Leaf,
  ArrowLeft,
} from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface TenantOverview {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  deletedAt: string | null;
  _count: {
    users: number;
    rides: number;
  };
  license: {
    tier: string;
    maxUsers: number;
    expiresAt: string | null;
  } | null;
  emailDomains: { domain: string }[];
  entraGroupId: string | null;
  entraTenantId: string | null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantOverview[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/admin/tenants");
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Aktive organisationer", value: tenants.filter((t) => !t.deletedAt).length, icon: Building2, color: "var(--color-primary-600)" },
          { label: "Brugere i alt", value: tenants.reduce((sum, t) => sum + (t._count?.users ?? 0), 0), icon: Users, color: "var(--color-accent-500)" },
          { label: "Med Entra ID", value: tenants.filter((t) => t.entraGroupId).length, icon: Shield, color: "#7C3AED" },
          { label: "Domæner", value: tenants.reduce((sum, t) => sum + (t.emailDomains?.length ?? 0), 0), icon: Plug, color: "#0EA5E9" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tenant List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <p className="text-sm" style={{ color: "var(--color-danger-500)" }}>{error}</p>
          <button onClick={fetchTenants} className="mt-3 text-sm underline" style={{ color: "var(--color-primary-600)" }}>Prøv igen</button>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <Building2 size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            {search ? `Ingen organisationer matcher "${search}"` : "Ingen organisationer endnu"}
          </p>
          {!search && (
            <Link href="/admin/super/tenants/new" className="inline-flex items-center gap-1 mt-3 text-sm font-medium underline" style={{ color: "var(--color-primary-600)" }}>
              <Plus size={14} /> Opret den første
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl group"
              style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}
            >
              {/* Avatar */}
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))", color: "var(--color-primary-700)" }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate" style={{ color: "var(--color-text-primary)" }}>{tenant.name}</h3>
                  {tenant.license && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tierColors[tenant.license.tier] ?? ""}`}>
                      {tenant.license.tier}
                    </span>
                  )}
                  {tenant.entraGroupId && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">ENTRA ID</span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {tenant.slug} · {tenant._count?.users ?? 0} brugere · {tenant.emailDomains?.map((d) => d.domain).join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
