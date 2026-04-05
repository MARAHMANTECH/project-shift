// Empty state component
// Per .rules/04: empty states MUST have illustrations and calls to action
// Brand Identity: Warm, organic, encouraging tone

import { type ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: ReactNode;
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 text-5xl animate-sway">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (onAction || actionHref) && (
        actionHref ? (
          <a href={actionHref}>
            <Button variant="cta" size="md">
              {actionLabel}
            </Button>
          </a>
        ) : (
          <Button variant="cta" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}

      {children}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
