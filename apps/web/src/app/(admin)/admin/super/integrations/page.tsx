"use client";

import { useState, useEffect } from "react";
import { Plug, RefreshCw, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface Integration {
  id: string;
  organizationId: string;
  integrationType: string;
  status: string;
  lastSyncAt: string | null;
  errorMessage: string | null;
  organization?: { name: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  ACTIVE: { label: "Aktiv", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
  INACTIVE: { label: "Inaktiv", color: "text-neutral-500 bg-neutral-100", icon: XCircle },
  ERROR: { label: "Fejl", color: "text-red-600 bg-red-50", icon: AlertCircle },
  SYNCING: { label: "Synkroniserer", color: "text-blue-600 bg-blue-50", icon: RefreshCw },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  async function fetchIntegrations(): Promise<void> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (e) {
      console.error("Failed to fetch integrations", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Integrationer
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Overblik over alle aktive integrationer på tværs af organisationer
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "I alt", value: integrations.length, color: "var(--color-primary-600)" },
          { label: "Aktive", value: integrations.filter((i) => i.status === "ACTIVE").length, color: "#10B981" },
          { label: "Fejl", value: integrations.filter((i) => i.status === "ERROR").length, color: "#EF4444" },
          { label: "Inaktive", value: integrations.filter((i) => i.status === "INACTIVE").length, color: "#6B7280" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</span>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />
          ))}
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <Plug size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Ingen integrationer konfigureret endnu
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            Integrationer oprettes pr. organisation via tenant-indstillinger
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => {
            const status = statusConfig[integration.status] ?? statusConfig.INACTIVE;
            const StatusIcon = status.icon;
            return (
              <div key={integration.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Plug size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {integration.integrationType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {integration.organization?.name ?? integration.organizationId}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${status.color}`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
