"use client";

import { useState, useEffect } from "react";
import { Leaf, TrendingUp, Car, Users } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface EsgOverview {
  totalCo2SavedKg: number;
  totalTrips: number;
  totalDistanceKm: number;
  totalPassengers: number;
  topOrganizations: {
    name: string;
    co2SavedKg: number;
    tripCount: number;
  }[];
}

export default function EsgOverviewPage() {
  const [data, setData] = useState<EsgOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEsg();
  }, []);

  async function fetchEsg(): Promise<void> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/esg");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error("Failed to fetch ESG data", e);
    } finally {
      setIsLoading(false);
    }
  }

  const stats = [
    { label: "CO₂ sparet", value: `${(data?.totalCo2SavedKg ?? 0).toFixed(1)} kg`, icon: Leaf, color: "#2D5A27" },
    { label: "Gennemførte ture", value: data?.totalTrips ?? 0, icon: Car, color: "var(--color-accent-500)" },
    { label: "Samlet distance", value: `${(data?.totalDistanceKm ?? 0).toFixed(0)} km`, icon: TrendingUp, color: "#7C3AED" },
    { label: "Passagerer transporteret", value: data?.totalPassengers ?? 0, icon: Users, color: "#0EA5E9" },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          ESG-overblik
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Samlet miljøpåvirkning på tværs af alle organisationer
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{isLoading ? "..." : stat.value}</p>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Top organisationer */}
      <div className="rounded-2xl p-6" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Top organisationer (CO₂)
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--color-surface-base)" }} />
            ))}
          </div>
        ) : (data?.topOrganizations?.length ?? 0) === 0 ? (
          <div className="text-center py-8">
            <Leaf size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Ingen ESG-data registreret endnu
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.topOrganizations.map((org, idx) => (
              <div key={org.name} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--color-surface-base)" }}>
                <span className="text-lg font-bold w-8 text-center" style={{ color: "var(--color-text-tertiary)" }}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{org.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{org.tripCount} ture</p>
                </div>
                <span className="text-sm font-bold" style={{ color: "#2D5A27" }}>
                  {org.co2SavedKg.toFixed(1)} kg CO₂
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
