// Changelog & Feedback — Hovedside med tab-navigation
// Route: /dashboard/changelog
// SoulEx Design: Pill-shaped tabs, tonal surfaces, No-Line Rule
// Inspireret af ENVO IT's Changelog & Feedback portal

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ScrollText, MessageSquarePlus, Hash } from "lucide-react";

// Changelog components & hooks
import { ChangelogStats } from "@/components/changelog/changelog-stats";
import { ChangelogFilters } from "@/components/changelog/changelog-filters";
import { ChangelogTimeline } from "@/components/changelog/changelog-timeline";
import { useChangelogs, useChangelogStats } from "@/hooks/use-changelog";

// Feedback components & hooks
import { FeedbackStats } from "@/components/feedback/feedback-stats";
import { FeedbackFilters } from "@/components/feedback/feedback-filters";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { useFeedbacks, useFeedbackStats } from "@/hooks/use-feedback";

type TabId = "changelog" | "feedback";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: typeof ScrollText;
}> = [
  { id: "changelog", label: "Changelog", icon: ScrollText },
  { id: "feedback", label: "Indmeldinger", icon: MessageSquarePlus },
];

/** Debounce hook for search input */
function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export default function ChangelogPage(): React.ReactElement {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>("changelog");

  // Changelog state
  const [changelogSearch, setChangelogSearch] = useState("");
  const [changelogType, setChangelogType] = useState<string | undefined>(undefined);
  const debouncedChangelogSearch = useDebounce(changelogSearch, 300);

  // Feedback state
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedFeedbackSearch = useDebounce(feedbackSearch, 300);

  // Data queries
  const changelogQuery = useChangelogs({
    type: changelogType,
    search: debouncedChangelogSearch || undefined,
  });
  const changelogStatsQuery = useChangelogStats();
  const feedbackQuery = useFeedbacks({
    status: feedbackStatus,
    search: debouncedFeedbackSearch || undefined,
  });
  const feedbackStatsQuery = useFeedbackStats();

  const handleOpenModal = useCallback((): void => setIsModalOpen(true), []);
  const handleCloseModal = useCallback((): void => setIsModalOpen(false), []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {activeTab === "changelog" ? "📋 Changelog" : "📮 Indmeldinger"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {activeTab === "changelog"
              ? "Historik over alle ændringer i platformen"
              : "Indsend feedback, fejl og ønsker"}
          </p>
        </div>

        {/* Build nummer badge (Changelog) */}
        {activeTab === "changelog" && changelogStatsQuery.data && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl surface-container">
            <Hash size={16} strokeWidth={1.5} className="text-[var(--muted-foreground)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Build</span>
            <span className="text-lg font-bold text-[var(--foreground)]">
              {changelogStatsQuery.data.latestBuild}
            </span>
          </div>
        )}
      </div>

      {/* Tab navigation — pill-shaped */}
      <div className="flex gap-1 p-1 rounded-2xl surface-container w-fit" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5
                rounded-xl text-sm font-semibold
                transition-all duration-200 ease-out
                cursor-pointer
                ${
                  isActive
                    ? "surface-lowest shadow-sm text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }
              `}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div role="tabpanel" className="space-y-6">
        {activeTab === "changelog" && (
          <>
            {/* Stats */}
            <ChangelogStats
              stats={changelogStatsQuery.data ?? { total: 0, features: 0, fixes: 0, improvements: 0, latestBuild: 0 }}
              isLoading={changelogStatsQuery.isLoading}
            />

            {/* Filters */}
            <ChangelogFilters
              search={changelogSearch}
              onSearchChange={setChangelogSearch}
              activeType={changelogType}
              onTypeChange={setChangelogType}
            />

            {/* Timeline */}
            <ChangelogTimeline
              entries={changelogQuery.data?.data ?? []}
              isLoading={changelogQuery.isLoading}
              latestBuild={changelogStatsQuery.data?.latestBuild}
            />
          </>
        )}

        {activeTab === "feedback" && (
          <>
            {/* Stats */}
            <FeedbackStats
              stats={feedbackStatsQuery.data ?? { active: 0, bugs: 0, features: 0, improvements: 0, inBuild: 0 }}
              isLoading={feedbackStatsQuery.isLoading}
            />

            {/* Filters + New button */}
            <FeedbackFilters
              search={feedbackSearch}
              onSearchChange={setFeedbackSearch}
              activeStatus={feedbackStatus}
              onStatusChange={setFeedbackStatus}
              onNewFeedback={handleOpenModal}
            />

            {/* Feedback list */}
            <div className="space-y-3">
              {feedbackQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-3xl animate-shimmer"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))
              ) : (feedbackQuery.data?.data ?? []).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">📮</p>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    Ingen indmeldinger endnu
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Vær den første til at indsende feedback!
                  </p>
                </div>
              ) : (
                (feedbackQuery.data?.data ?? []).map((entry) => (
                  <FeedbackCard key={entry.id} entry={entry} />
                ))
              )}
            </div>

            {/* Modal */}
            <FeedbackModal isOpen={isModalOpen} onClose={handleCloseModal} />
          </>
        )}
      </div>
    </div>
  );
}
