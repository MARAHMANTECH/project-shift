// Status badges for rides and other entities
// Brand Identity: Forest Green + Sun-kissed Orange palette

type BadgeVariant =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "success"
  | "warning"
  | "info"
  | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const variantConfig: Record<
  BadgeVariant,
  { bg: string; text: string; icon: string }
> = {
  scheduled: {
    bg: "bg-info/10",
    text: "text-info",
    icon: "🗓️",
  },
  in_progress: {
    bg: "bg-primary-500/10",
    text: "text-primary-600 dark:text-primary-400",
    icon: "🚗",
  },
  completed: {
    bg: "bg-success/10",
    text: "text-success",
    icon: "✅",
  },
  cancelled: {
    bg: "bg-neutral-300/30 dark:bg-neutral-700/30",
    text: "text-neutral-500",
    icon: "❌",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    icon: "✓",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    icon: "⚠️",
  },
  info: {
    bg: "bg-info/10",
    text: "text-info",
    icon: "ℹ️",
  },
  neutral: {
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-600 dark:text-neutral-400",
    icon: "•",
  },
};

/** Human readable danish label for ride status */
export function rideStatusLabel(
  status: string
): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "SCHEDULED":
      return { variant: "scheduled", label: "Planlagt" };
    case "IN_PROGRESS":
      return { variant: "in_progress", label: "I gang" };
    case "COMPLETED":
      return { variant: "completed", label: "Gennemført" };
    case "CANCELLED":
      return { variant: "cancelled", label: "Aflyst" };
    default:
      return { variant: "neutral", label: status };
  }
}

function Badge({ variant, label, className = "" }: BadgeProps) {
  const config = variantConfig[variant];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1
        text-xs font-semibold rounded-full
        ${config.bg} ${config.text}
        ${className}
      `.trim()}
    >
      <span className="text-[10px]" aria-hidden="true">
        {config.icon}
      </span>
      {label}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
