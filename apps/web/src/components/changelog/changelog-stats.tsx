// Changelog Stats — 4 farvekodede stats-kort med venstre accent-linje
// SoulEx Design: surface-low baggrund, tonal layering, No-Line Rule
// Per .rules/05-branding.md: Min 16px radius, varme farver

"use client";

import { Card } from "@/components/ui/card";
import type { ChangelogStats as ChangelogStatsType } from "@/hooks/use-changelog";

interface ChangelogStatsProps {
  stats: ChangelogStatsType;
  isLoading?: boolean;
}

const STAT_ITEMS: Array<{
  key: keyof ChangelogStatsType;
  label: string;
  accentColor: string;
  icon: string;
}> = [
  {
    key: "total",
    label: "Releases",
    accentColor: "bg-neutral-500",
    icon: "📦",
  },
  {
    key: "features",
    label: "Nye features",
    accentColor: "bg-primary-500",
    icon: "✨",
  },
  {
    key: "fixes",
    label: "Rettelser",
    accentColor: "bg-error",
    icon: "🔧",
  },
  {
    key: "improvements",
    label: "Forbedringer",
    accentColor: "bg-info",
    icon: "⬆️",
  },
];

function ChangelogStatsCard({
  stat,
  value,
  isLoading,
}: {
  stat: (typeof STAT_ITEMS)[0];
  value: number;
  isLoading?: boolean;
}): React.ReactElement {
  return (
    <Card
      variant="default"
      className="relative overflow-hidden p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Farvet accent-linje (venstre) */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${stat.accentColor}`}
      />
      <div className="pl-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-16 rounded-xl animate-shimmer" />
            <div className="h-4 w-20 rounded-lg animate-shimmer" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-[var(--foreground)] tabular-nums font-sans animate-count-up">
              {value}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 flex items-center gap-1.5">
              <span className="text-xs">{stat.icon}</span>
              {stat.label}
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

function ChangelogStats({
  stats,
  isLoading,
}: ChangelogStatsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_ITEMS.map((stat) => (
        <ChangelogStatsCard
          key={stat.key}
          stat={stat}
          value={stats[stat.key] ?? 0}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

export { ChangelogStats };
