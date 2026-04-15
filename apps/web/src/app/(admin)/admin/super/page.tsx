"use client";

// Super Admin Dashboard — Platform KPI'er og hurtige links
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2, Users, Car, Leaf, Calendar, Shield, CreditCard,
  MessageSquare, FileText, ChevronRight, TrendingUp, Activity,
} from "lucide-react";
import { AdminShell } from "./components/admin-shell";

interface DashboardStats {
  organizations: { total: number; active: number };
  users: { total: number; active: number };
  rides: { total: number; completed: number };
  events: { total: number };
  esg: { totalCo2SavedKg: number };
  licenseTiers: { tier: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  feedbackStats: { status: string; count: number }[];
  recentAudit: {
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user: { email: string; firstName: string; lastName: string } | null;
    organization: { name: string } | null;
  }[];
}

const tierColors: Record<string, string> = {
  TRIAL: "#F59E0B",
  STARTER: "#3B82F6",
  PROFESSIONAL: "#8B5CF6",
  ENTERPRISE: "#10B981",
};

const roleLabels: Record<string, string> = {
  MEMBER: "Medlemmer",
  ORG_ADMIN: "Org Admins",
  SUPER_ADMIN: "Super Admins",
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats(): Promise<void> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch dashboard stats:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const kpiCards = [
    { label: "Organisationer", value: stats?.organizations.active ?? 0, sub: `${stats?.organizations.total ?? 0} total`, icon: Building2, color: "#2D5A27", href: "/admin/super/tenants" },
    { label: "Brugere", value: stats?.users.active ?? 0, sub: `${stats?.users.total ?? 0} registrerede`, icon: Users, color: "#FF8C42", href: "/admin/super/users" },
    { label: "Gennemførte ture", value: stats?.rides.completed ?? 0, sub: `${stats?.rides.total ?? 0} total`, icon: Car, color: "#3B82F6", href: "/admin/super/esg" },
    { label: "CO₂ sparet", value: `${((stats?.esg.totalCo2SavedKg ?? 0) / 1000).toFixed(1)}t`, sub: `${(stats?.esg.totalCo2SavedKg ?? 0).toFixed(0)} kg`, icon: Leaf, color: "#10B981", href: "/admin/super/esg" },
    { label: "Events", value: stats?.events.total ?? 0, sub: "Arrangementer", icon: Calendar, color: "#8B5CF6", href: "#" },
  ];

  const quickLinks = [
    { label: "Brugerstyring", desc: "Administrér roller og adgang", icon: Users, href: "/admin/super/users", color: "#FF8C42" },
    { label: "Audit Log", desc: "Sporbarhed og compliance", icon: Activity, href: "/admin/super/audit", color: "#EF4444" },
    { label: "Licenser", desc: "Licensoversigt", icon: CreditCard, href: "/admin/super/licenses", color: "#8B5CF6" },
    { label: "Feedback", desc: "Brugerindmeldinger", icon: MessageSquare, href: "/admin/super/feedback", color: "#3B82F6" },
    { label: "Changelog", desc: "Versionsstyring", icon: FileText, href: "/admin/super/changelog", color: "#10B981" },
  ];

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Shield size={24} style={{ color: "#2D5A27" }} />
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Platform Dashboard
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Overblik over hele Project SHIFT platformen
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {kpiCards.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="p-4 rounded-2xl group hover:scale-[1.02] transition-all duration-200"
            style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {isLoading ? "..." : kpi.value}
            </p>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{kpi.label}</span>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{kpi.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* License Distribution */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Licensfordeling
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "var(--color-surface-base)" }} />)}</div>
          ) : (
            <div className="space-y-3">
              {(stats?.licenseTiers ?? []).map((lt) => (
                <div key={lt.tier} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ background: tierColors[lt.tier] ?? "#ccc" }} />
                  <span className="text-xs font-medium flex-1" style={{ color: "var(--color-text-primary)" }}>{lt.tier}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{lt.count}</span>
                </div>
              ))}
              {(stats?.licenseTiers?.length ?? 0) === 0 && (
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Ingen licensdata</p>
              )}
            </div>
          )}
        </div>

        {/* Role Distribution */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Rollefordeling
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "var(--color-surface-base)" }} />)}</div>
          ) : (
            <div className="space-y-3">
              {(stats?.roleDistribution ?? []).map((rd) => {
                const total = stats?.users.total ?? 1;
                const pct = Math.round((rd.count / total) * 100);
                return (
                  <div key={rd.role}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{roleLabels[rd.role] ?? rd.role}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>{rd.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--color-surface-base)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: rd.role === "SUPER_ADMIN" ? "#EF4444" : rd.role === "ORG_ADMIN" ? "#8B5CF6" : "#2D5A27" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback Pipeline */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Feedback Pipeline
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "var(--color-surface-base)" }} />)}</div>
          ) : (
            <div className="space-y-2">
              {(stats?.feedbackStats ?? []).map((fs) => {
                const statusLabels: Record<string, string> = { NEW: "Nye", UNDER_REVIEW: "Under review", PLANNED: "Planlagt", IN_BUILD: "I build", DONE: "Færdige" };
                const statusColors: Record<string, string> = { NEW: "#F59E0B", UNDER_REVIEW: "#3B82F6", PLANNED: "#8B5CF6", IN_BUILD: "#FF8C42", DONE: "#10B981" };
                return (
                  <div key={fs.status} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "var(--color-surface-base)" }}>
                    <div className="h-2 w-2 rounded-full" style={{ background: statusColors[fs.status] ?? "#ccc" }} />
                    <span className="text-xs font-medium flex-1" style={{ color: "var(--color-text-primary)" }}>{statusLabels[fs.status] ?? fs.status}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{fs.count}</span>
                  </div>
                );
              })}
              {(stats?.feedbackStats?.length ?? 0) === 0 && (
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Ingen feedback</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Hurtig adgang
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="p-4 rounded-2xl group hover:scale-[1.02] transition-all duration-200 flex flex-col"
              style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${link.color}15` }}>
                <link.icon size={18} style={{ color: link.color }} />
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{link.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{link.desc}</p>
              <ChevronRight size={14} className="mt-auto self-end opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "var(--color-text-secondary)" }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 rounded-2xl p-5" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Seneste aktivitet</h2>
          <Link href="/admin/super/audit" className="text-xs font-medium hover:underline" style={{ color: "var(--color-primary-600)" }}>
            Se alle →
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "var(--color-surface-base)" }} />)}</div>
        ) : (stats?.recentAudit?.length ?? 0) === 0 ? (
          <p className="text-xs py-6 text-center" style={{ color: "var(--color-text-tertiary)" }}>Ingen aktivitet registreret</p>
        ) : (
          <div className="space-y-1.5">
            {stats?.recentAudit.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "var(--color-surface-base)" }}>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}>
                  {entry.user?.firstName?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                    {entry.user?.firstName} {entry.user?.lastName} — <span className="font-bold">{entry.action}</span>
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                    {entry.entity} · {entry.organization?.name ?? "—"} · {new Date(entry.createdAt).toLocaleString("da-DK")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
