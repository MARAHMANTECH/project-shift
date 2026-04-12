// Changelog Timeline — Vertikal build-timeline med ekspanderbare kort
// SoulEx Design: surface-lowest cards, ambient shadows, tonal dots
// Inspireret af ENVO IT's portal men tilpasset Project SHIFT's varme æstetik

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ChangelogEntry } from "@/hooks/use-changelog";

interface ChangelogTimelineProps {
  entries: ChangelogEntry[];
  isLoading?: boolean;
  latestBuild?: number;
}

/** Gruppér changelog entries efter versionBuild */
function groupByBuild(
  entries: ChangelogEntry[]
): Map<number, ChangelogEntry[]> {
  const groups = new Map<number, ChangelogEntry[]>();
  for (const entry of entries) {
    const existing = groups.get(entry.versionBuild) ?? [];
    existing.push(entry);
    groups.set(entry.versionBuild, existing);
  }
  return groups;
}

/** Formatér dato på dansk */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Type badge config */
const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  FEATURE: {
    label: "Nyt",
    bg: "bg-primary-500/10",
    text: "text-primary-600",
    icon: "✨",
  },
  FIX: {
    label: "Rettelse",
    bg: "bg-error/10",
    text: "text-error",
    icon: "🔧",
  },
  IMPROVEMENT: {
    label: "Forbedring",
    bg: "bg-info/10",
    text: "text-info",
    icon: "⬆️",
  },
};

function BuildGroup({
  build,
  entries,
  isLatest,
  defaultExpanded,
}: {
  build: number;
  entries: ChangelogEntry[];
  isLatest: boolean;
  defaultExpanded: boolean;
}): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const publishDate = entries[0]?.publishedAt ?? entries[0]?.createdAt;

  return (
    <div className="relative animate-fade-in-up">
      {/* Timeline-linje */}
      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-[var(--color-surface-highest)]" />

      {/* Build header */}
      <button
        id={`changelog-build-${build}`}
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          flex items-center gap-3 w-full text-left
          group cursor-pointer
          mb-3
        "
      >
        {/* Timeline dot */}
        <div
          className={`
            relative z-10 flex h-10 w-10 items-center justify-center
            rounded-full shrink-0
            transition-all duration-200
            ${
              isLatest
                ? "gradient-forest text-white shadow-md"
                : "surface-highest text-[var(--muted-foreground)]"
            }
          `}
        >
          {isExpanded ? (
            <ChevronDown size={16} strokeWidth={2} />
          ) : (
            <ChevronRight size={16} strokeWidth={2} />
          )}
        </div>

        {/* Build info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            Build {build}
          </h3>
          {isLatest && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-600">
              Seneste
            </span>
          )}
        </div>

        {/* Dato */}
        {publishDate && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] shrink-0">
            <Calendar size={14} strokeWidth={1.5} />
            {formatDate(publishDate)}
          </span>
        )}
      </button>

      {/* Entries */}
      {isExpanded && (
        <div className="ml-[19px] pl-8 pb-6 space-y-3">
          {entries.map((entry, index) => (
            <Card
              key={entry.id}
              variant="default"
              className={`
                p-5 hover:shadow-card-hover transition-all duration-300
                animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Type badge */}
              <div className="flex items-start gap-3">
                <span
                  className={`
                    inline-flex items-center gap-1 px-2.5 py-1
                    rounded-full text-xs font-semibold shrink-0
                    ${TYPE_CONFIG[entry.type]?.bg ?? "bg-neutral-100"}
                    ${TYPE_CONFIG[entry.type]?.text ?? "text-neutral-600"}
                  `}
                >
                  <span className="text-[10px]">
                    {TYPE_CONFIG[entry.type]?.icon ?? "•"}
                  </span>
                  {TYPE_CONFIG[entry.type]?.label ?? entry.type}
                </span>
              </div>

              {/* Titel + beskrivelse */}
              <h4 className="font-semibold text-[var(--foreground)] mt-2.5 text-[15px]">
                {entry.title}
              </h4>
              <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                {entry.description}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ChangelogTimeline({
  entries,
  isLoading,
  latestBuild,
}: ChangelogTimelineProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="h-10 w-10 rounded-full animate-shimmer shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-32 rounded-xl animate-shimmer" />
              <div className="h-24 rounded-3xl animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-lg font-semibold text-[var(--foreground)]">
          Ingen changelog-entries endnu
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Ændringer vil blive vist her, efterhånden som de udgives.
        </p>
      </div>
    );
  }

  const grouped = groupByBuild(entries);
  const sortedBuilds = Array.from(grouped.keys()).sort((a, b) => b - a);

  return (
    <div className="space-y-2">
      {sortedBuilds.map((build, index) => (
        <BuildGroup
          key={build}
          build={build}
          entries={grouped.get(build) ?? []}
          isLatest={build === (latestBuild ?? sortedBuilds[0])}
          defaultExpanded={index < 3}
        />
      ))}
    </div>
  );
}

export { ChangelogTimeline };
