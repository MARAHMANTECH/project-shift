// Feedback Filters — Søgebar + status-filter dropdown
// SoulEx Design: Pill-shaped controls, No-Line Rule, tonal surfaces

"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeStatus: string | undefined;
  onStatusChange: (status: string | undefined) => void;
  onNewFeedback: () => void;
}

const STATUS_OPTIONS: Array<{
  value: string | undefined;
  label: string;
}> = [
  { value: undefined, label: "Alle" },
  { value: "NEW", label: "Nye" },
  { value: "UNDER_REVIEW", label: "Under vurdering" },
  { value: "PLANNED", label: "Planlagte" },
  { value: "IN_BUILD", label: "I Build" },
  { value: "DONE", label: "Udførte" },
];

function FeedbackFilters({
  search,
  onSearchChange,
  activeStatus,
  onStatusChange,
  onNewFeedback,
}: FeedbackFiltersProps): React.ReactElement {
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
          id="feedback-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Søg i indmeldinger..."
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

      {/* Status dropdown + Ny indmelding knap */}
      <div className="flex items-center gap-3">
        <select
          id="feedback-status-filter"
          value={activeStatus ?? ""}
          onChange={(e) =>
            onStatusChange(e.target.value === "" ? undefined : e.target.value)
          }
          className="
            px-4 py-2.5
            rounded-full
            surface-high
            text-sm font-medium
            text-[var(--foreground)]
            appearance-none
            cursor-pointer
            pr-8
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            transition-all duration-200
          "
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237D7468' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </select>

        <Button
          id="feedback-new-btn"
          variant="forest"
          size="md"
          onClick={onNewFeedback}
        >
          <Plus size={18} strokeWidth={2} />
          Ny indmelding
        </Button>
      </div>
    </div>
  );
}

export { FeedbackFilters };
