// PersonalityBadge — Sociale præference-badges for ture
// Brand Identity: Varm, organisk, menneskecentreret

interface PersonalityBadgeProps {
  type: "music" | "talkative" | "quiet" | "luggage" | "pet-friendly" | "coffee";
  className?: string;
}

const BADGE_CONFIG: Record<
  PersonalityBadgeProps["type"],
  { icon: string; label: string; colorClass: string }
> = {
  music: {
    icon: "🎵",
    label: "Musik OK",
    colorClass: "bg-accent-400/10 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400",
  },
  talkative: {
    icon: "💬",
    label: "Snaksalig",
    colorClass: "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
  },
  quiet: {
    icon: "🤫",
    label: "Stille tur",
    colorClass: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  luggage: {
    icon: "🧳",
    label: "Bagage OK",
    colorClass: "bg-info/10 text-info dark:bg-info/15",
  },
  "pet-friendly": {
    icon: "🐾",
    label: "Kæledyr OK",
    colorClass: "bg-warning/10 text-warning dark:bg-warning/15",
  },
  coffee: {
    icon: "☕",
    label: "Kaffepause",
    colorClass: "bg-accent-400/10 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400",
  },
};

function PersonalityBadge({ type, className = "" }: PersonalityBadgeProps) {
  const config = BADGE_CONFIG[type];

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-[11px] font-medium rounded-full
        ${config.colorClass}
        ${className}
      `}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

export { PersonalityBadge, type PersonalityBadgeProps };
