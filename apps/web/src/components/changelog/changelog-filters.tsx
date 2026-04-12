// Changelog Filters — Søgebar + pill-formede filter-tags
// SoulEx Design: Pill-shaped tags med min 16px radius, No-Line Rule
// Per .rules/05-branding.md: Rounded, organisk, premium

"use client";

import { Search } from "lucide-react";

interface ChangelogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeType: string | undefined;
  onTypeChange: (type: string | undefined) => void;
}

const TYPE_FILTERS: Array<{
  value: string | undefined;
  label: string;
  icon: string;
}> = [
  { value: undefined, label: "Alle", icon: "📋" },
  { value: "FEATURE", label: "Feature", icon: "✨" },
  { value: "FIX", label: "Fix", icon: "🔧" },
  { value: "IMPROVEMENT", label: "Forbedring", icon: "⬆️" },
];

function ChangelogFilters({
  search,
  onSearchChange,
  activeType,
  onTypeChange,
}: ChangelogFiltersProps): React.ReactElement {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Søgebar */}
      <div className="relative flex-1 max-w-lg w-full">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          size={18}
          strokeWidth={1.5}
        />
        <input
          id="changelog-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Søg i changelog..."
          className="
            w-full pl-11 pr-4 py-3
            rounded-2xl
            surface-container
            text-sm font-[var(--font-body)]
            text-[var(--foreground)]
            placeholder:text-[var(--muted-foreground)]
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            transition-all duration-200
          "
        />
      </div>

      {/* Pill filter tags */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((filter) => {
          const isActive = activeType === filter.value;
          return (
            <button
              key={filter.label}
              id={`changelog-filter-${filter.label.toLowerCase()}`}
              onClick={() => onTypeChange(filter.value)}
              className={`
                inline-flex items-center gap-1.5
                px-4 py-2 rounded-full
                text-sm font-medium
                transition-all duration-200 ease-out
                cursor-pointer
                ${
                  isActive
                    ? "bg-primary-500 text-white shadow-sm"
                    : "surface-high text-[var(--muted-foreground)] hover:surface-highest hover:text-[var(--foreground)]"
                }
              `}
            >
              <span className="text-xs">{filter.icon}</span>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ChangelogFilters };
