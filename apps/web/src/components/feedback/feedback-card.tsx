// Feedback Card — Individuel indmelding med status, prioritet og alder
// SoulEx Design: surface-lowest, ambient shadows, type/status badges
// Per .rules/05-branding.md: Min 16px radius, tinted shadows

"use client";

import { Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { FeedbackEntry } from "@/hooks/use-feedback";

interface FeedbackCardProps {
  entry: FeedbackEntry;
}

/** Beregn alder i dage/timer */
function getAge(dateString: string): string {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours <= 0 ? "Nu" : `${diffHours}t`;
  }
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mdr`;
}

/** Type badge config */
const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  BUG: {
    label: "Fejl",
    bg: "bg-error/10",
    text: "text-error",
    icon: "🐛",
  },
  FEATURE: {
    label: "Feature",
    bg: "bg-primary-500/10",
    text: "text-primary-600",
    icon: "✨",
  },
  IMPROVEMENT: {
    label: "Forbedring",
    bg: "bg-info/10",
    text: "text-info",
    icon: "⬆️",
  },
};

/** Status badge config */
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  NEW: {
    label: "Ny",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  UNDER_REVIEW: {
    label: "Under vurdering",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  PLANNED: {
    label: "Planlagt",
    bg: "bg-info/10",
    text: "text-info",
    dot: "bg-info",
  },
  IN_BUILD: {
    label: "I Build",
    bg: "bg-accent-500/10",
    text: "text-accent-600",
    dot: "bg-accent-500",
  },
  DONE: {
    label: "Udført",
    bg: "bg-neutral-200",
    text: "text-neutral-500",
    dot: "bg-neutral-400",
  },
};

/** Prioritet badge config */
const PRIORITY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  LOW: { label: "Lav", bg: "bg-neutral-100", text: "text-neutral-500" },
  MEDIUM: { label: "Medium", bg: "bg-warning/10", text: "text-warning" },
  HIGH: { label: "Høj", bg: "bg-error/10", text: "text-error" },
};

function FeedbackCard({ entry }: FeedbackCardProps): React.ReactElement {
  const typeConf = TYPE_CONFIG[entry.type];
  const statusConf = STATUS_CONFIG[entry.status];
  const priorityConf = PRIORITY_CONFIG[entry.priority];

  return (
    <Card
      variant="default"
      className="p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
    >
      {/* Header: Type ikon + titel */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl shrink-0 text-base ${typeConf?.bg ?? "bg-neutral-100"}`}
        >
          {typeConf?.icon ?? "•"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--foreground)] text-[15px] leading-snug">
            {entry.title}
          </h4>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
            {entry.content}
          </p>
        </div>
      </div>

      {/* Footer: Badges + meta */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {/* Status badge */}
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1
            rounded-full text-xs font-semibold
            ${statusConf?.bg ?? "bg-neutral-100"}
            ${statusConf?.text ?? "text-neutral-500"}
          `}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConf?.dot ?? "bg-neutral-400"}`}
          />
          {statusConf?.label ?? entry.status}
        </span>

        {/* Prioritet */}
        <span
          className={`
            inline-flex items-center px-2.5 py-1
            rounded-full text-xs font-medium
            ${priorityConf?.bg ?? "bg-neutral-100"}
            ${priorityConf?.text ?? "text-neutral-500"}
          `}
        >
          {priorityConf?.label ?? entry.priority}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bruger */}
        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <User size={12} strokeWidth={1.5} />
          {entry.user.firstName} {entry.user.lastName}
        </span>

        {/* Alder */}
        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock size={12} strokeWidth={1.5} />
          {getAge(entry.createdAt)}
        </span>
      </div>
    </Card>
  );
}

export { FeedbackCard };
