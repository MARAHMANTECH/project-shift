// Stat card — Editorial Organicism: Tonal surface, ambient shadows
// Brand Identity: Warm, organic, Forest Green + Sun-kissed Orange

import { Card } from "./card";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  accentColor?: "green" | "orange" | "neutral";
  className?: string;
}

const accentGradients: Record<string, string> = {
  green: "from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10",
  orange: "from-accent-400/10 to-accent-500/15 dark:from-accent-500/15 dark:to-accent-600/10",
  neutral: "from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700",
};

function StatCard({ icon, label, value, trend, accentColor = "green", className = "" }: StatCardProps) {
  return (
    <Card
      variant="default"
      className={`p-5 lg:p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accentGradients[accentColor]} text-xl`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              trend.value >= 0
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="animate-count-up">
        <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums font-sans">
          {value}
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {label}
        </p>
      </div>

      {trend && (
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          {trend.label}
        </p>
      )}
    </Card>
  );
}

export { StatCard, type StatCardProps };
