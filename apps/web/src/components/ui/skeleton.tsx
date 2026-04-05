// Skeleton loading components
// Per .rules/04: loading states use skeleton screens, NOT spinners
// Brand Identity: Warm Sand shimmer tones

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-2xl ${className}`}
      role="status"
      aria-label="Indlæser..."
    />
  );
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Indlæser tekst...">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-3xl bg-[var(--card)] p-6 shadow-card space-y-4"
      role="status"
      aria-label="Indlæser kort..."
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div
      className="rounded-3xl bg-[var(--card)] p-6 shadow-card space-y-4"
      role="status"
      aria-label="Indlæser statistik..."
    >
      <Skeleton className="h-11 w-11 rounded-2xl" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Indlæser liste...">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonStatCard, SkeletonList };
