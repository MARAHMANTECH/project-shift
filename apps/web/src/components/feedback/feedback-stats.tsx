// Feedback Stats — 5 farvekodede stats-kort (Aktive, Fejl, Features, Forbedringer, I Build)
// SoulEx Design: Tonal layering, farvede accent-linjer, No-Line Rule
// Inspireret af ENVO IT's Indmeldinger-visning

"use client";

import { Card } from "@/components/ui/card";
import type { FeedbackStats as FeedbackStatsType } from "@/hooks/use-feedback";

interface FeedbackStatsProps {
  stats: FeedbackStatsType;
  isLoading?: boolean;
}

const STAT_ITEMS: Array<{
  key: keyof FeedbackStatsType;
  label: string;
  accentColor: string;
  icon: string;
}> = [
  {
    key: "active",
    label: "Aktive",
    accentColor: "bg-accent-500",
    icon: "📌",
  },
  {
    key: "bugs",
    label: "Fejl",
    accentColor: "bg-error",
    icon: "🐛",
  },
  {
    key: "features",
    label: "Features",
    accentColor: "bg-primary-500",
    icon: "✨",
  },
  {
    key: "improvements",
    label: "Forbedringer",
    accentColor: "bg-info",
    icon: "⬆️",
  },
  {
    key: "inBuild",
    label: "I Build",
    accentColor: "bg-success",
    icon: "🔨",
  },
];

function FeedbackStats({
  stats,
  isLoading,
}: FeedbackStatsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {STAT_ITEMS.map((stat) => (
        <Card
          key={stat.key}
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
                <div className="h-8 w-12 rounded-xl animate-shimmer" />
                <div className="h-4 w-16 rounded-lg animate-shimmer" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums font-sans animate-count-up">
                  {stats[stat.key] ?? 0}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                  <span className="text-[10px]">{stat.icon}</span>
                  {stat.label}
                </p>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export { FeedbackStats };
