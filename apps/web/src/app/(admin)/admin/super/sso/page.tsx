"use client";

// SSO Management — alle SSO-forbindelser cross-tenant
import { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface SsoConnection {
  id: string;
  provider: string;
  status: string;
  domain: string;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string; slug: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  ACTIVE: { label: "Aktiv", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  PENDING: { label: "Afventer", color: "bg-amber-100 text-amber-700", icon: Clock },
  DISABLED: { label: "Deaktiveret", color: "bg-neutral-100 text-neutral-500", icon: XCircle },
  ERROR: { label: "Fejl", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function SsoManagementPage() {
  const [connections, setConnections] = useState<SsoConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchConnections(); }, []);

  async function fetchConnections(): Promise<void> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/sso");
      if (res.ok) setConnections(await res.json());
    } catch (e) {
      console.error("Failed to fetch SSO connections:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Stats
  const stats = [
    { label: "I alt", value: connections.length, color: "var(--color-primary-600)" },
    { label: "Aktive", value: connections.filter((c) => c.status === "ACTIVE").length, color: "#10B981" },
    { label: "Afventende", value: connections.filter((c) => c.status === "PENDING").length, color: "#F59E0B" },
    { label: "Fejl", value: connections.filter((c) => c.status === "ERROR").length, color: "#EF4444" },
  ];

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>SSO & Identity</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Alle SSO-forbindelser på tværs af organisationer</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</span>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Connection List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />)}</div>
      ) : connections.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <KeyRound size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Ingen SSO-forbindelser konfigureret</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>SSO aktiveres pr. organisation via Entra ID</p>
        </div>
      ) : (
        <div className="space-y-2">
          {connections.map((conn) => {
            const status = statusConfig[conn.status] ?? statusConfig.DISABLED;
            const StatusIcon = status.icon;
            return (
              <div key={conn.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <KeyRound size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{conn.provider}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${status.color}`}>
                      <StatusIcon size={10} /> {status.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {conn.organization.name} · {conn.domain}
                    {conn.tenantId && ` · Tenant: ${conn.tenantId.substring(0, 8)}...`}
                  </p>
                </div>
                <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {new Date(conn.updatedAt).toLocaleDateString("da-DK")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
