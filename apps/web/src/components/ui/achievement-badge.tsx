// AchievementBadge — Gamificeret ESG præstation
// Brand Identity: Belønning, vækst, natur-metaforer

import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  /** Emoji-ikon for præstationen */
  icon: string;
  /** Navn på præstationen */
  name: string;
  /** Beskrivelse */
  description: string;
  /** Er præstationen låst op? */
  unlocked: boolean;
  /** Er dette den aktuelle rang? */
  isCurrent?: boolean;
  /** Progres mod denne præstation (0-100) — vises kun for låste */
  progress?: number;
  className?: string;
}

function AchievementBadge({
  icon,
  name,
  description,
  unlocked,
  isCurrent = false,
  progress,
  className = "",
}: AchievementBadgeProps) {
  const stateClass = isCurrent
    ? "achievement-badge-current"
    : unlocked
      ? "achievement-badge-unlocked"
      : "achievement-badge-locked";

  return (
    <div
      className={`achievement-badge ${stateClass} ${isCurrent ? "animate-shimmer-glow" : ""} ${className}`}
    >
      {/* Icon */}
      <div
        className={`text-3xl mb-2 ${unlocked ? "animate-sway" : ""} ${
          isCurrent ? "drop-shadow-lg" : ""
        }`}
      >
        {unlocked ? icon : <Lock size={28} className="text-neutral-400 mx-auto" strokeWidth={1.5} />}
      </div>

      {/* Name */}
      <p className="text-xs font-bold text-[var(--foreground)]">{name}</p>

      {/* Description */}
      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{description}</p>

      {/* Current badge indicator */}
      {isCurrent && (
        <span className="mt-2 text-[10px] font-bold text-accent-600 bg-accent-400/10 px-2 py-0.5 rounded-full">
          Aktuel
        </span>
      )}

      {/* Progress indicator for locked badges */}
      {!unlocked && progress !== undefined && (
        <span className="mt-2 text-[10px] text-[var(--muted-foreground)]">
          {progress.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export { AchievementBadge, type AchievementBadgeProps };
