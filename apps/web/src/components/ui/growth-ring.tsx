// GrowthRing — Cirkulær ESG progress-visualisering
// Brand Identity: Gamificeret, organisk, naturinspireret

import { TreePine } from "lucide-react";

interface GrowthRingProps {
  /** Progress fra 0-100 */
  progress: number;
  /** Primær værdi (f.eks. "127.4 kg") */
  value: string;
  /** Sekundær label (f.eks. "CO₂ sparet") */
  label: string;
  /** Størrelse i pixels */
  size?: number;
  className?: string;
}

function GrowthRing({
  progress,
  value,
  label,
  size = 180,
  className = "",
}: GrowthRingProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const showPulse = clampedProgress >= 50;

  // Tree scale grows with progress (0.6 → 1.0)
  const treeScale = 0.6 + (clampedProgress / 100) * 0.4;

  return (
    <div
      className={`growth-ring ${showPulse ? "animate-ring-pulse" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        "--ring-progress": clampedProgress,
      } as React.CSSProperties}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${value}`}
    >
      {/* Conic gradient track */}
      <div className="growth-ring-track" />

      {/* Inner content */}
      <div className="growth-ring-inner">
        <TreePine
          size={size * 0.22}
          strokeWidth={1.5}
          className="text-primary-600 dark:text-primary-400 mb-1 transition-transform duration-500"
          style={{ transform: `scale(${treeScale})` }}
        />
        <span className="text-2xl font-bold text-[var(--foreground)] tabular-nums font-sans leading-none">
          {value}
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

export { GrowthRing, type GrowthRingProps };
