"use client";

import { Suspense } from "react";
import Image from "next/image";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { GrowthRing } from "@/components/ui/growth-ring";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { useEsgSummary } from "@/hooks/use-esg";
import { Leaf, Car, Route, BarChart3, Award, TreePine } from "lucide-react";

// ── ESG Achievement Levels ──
function getEsgLevel(co2Kg: number): { name: string; icon: string; next: number; color: string } {
  if (co2Kg >= 500) return { name: "Klimahelt", icon: "🏆", next: 1000, color: "text-accent-500" };
  if (co2Kg >= 200) return { name: "Grøn Pendler", icon: "🌟", next: 500, color: "text-primary-500" };
  if (co2Kg >= 50) return { name: "Skov-Vogter", icon: "🌿", next: 200, color: "text-primary-600" };
  if (co2Kg >= 10) return { name: "Grøn Starter", icon: "🌱", next: 50, color: "text-primary-400" };
  return { name: "Ny pendler", icon: "🚗", next: 10, color: "text-neutral-500" };
}

// ── Achievement Badge Data ──
const ACHIEVEMENTS = [
  { icon: "🌱", name: "Grøn Starter", desc: "Spar 10 kg CO₂", threshold: 10 },
  { icon: "🌿", name: "Skov-Vogter", desc: "Spar 50 kg CO₂", threshold: 50 },
  { icon: "🌟", name: "Grøn Pendler", desc: "Spar 200 kg CO₂", threshold: 200 },
  { icon: "🏆", name: "Klimahelt", desc: "Spar 500 kg CO₂", threshold: 500 },
];

function EsgDashboardContent() {
  const { data: esg, isLoading } = useEsgSummary();

  const co2Saved = esg?.totalCo2SavedKg ?? 0;
  const treesEquivalent = Math.ceil(co2Saved / 22);
  const level = getEsgLevel(co2Saved);
  const progressToNext = Math.min((co2Saved / level.next) * 100, 100);

  // Mock monthly data (erstattes med rigtig data senere)
  const monthlyData = [
    { month: "Jan", co2: 12 },
    { month: "Feb", co2: 28 },
    { month: "Mar", co2: co2Saved },
    { month: "Apr", co2: 0 },
    { month: "Maj", co2: 0 },
    { month: "Jun", co2: 0 },
  ];
  const maxCo2 = Math.max(...monthlyData.map((d) => d.co2), 1);

  return (
    <>
      {/* ── Growth Ring Hero — Stitch Koncept 3 ── */}
      <div className="relative -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 overflow-hidden">
        {/* Dark gradient baggrund */}
        <div className="relative w-full bg-gradient-to-b from-neutral-900 via-neutral-800 to-[var(--background)] pt-8 pb-12 px-4 lg:px-6">
          {/* Cirkulær growth ring — centreret */}
          <div className="flex flex-col items-center">
            <GrowthRing
              progress={progressToNext}
              value={`${co2Saved.toFixed(1)}`}
              label="kg CO₂ sparet"
              size={180}
              className="mb-4"
            />

            {/* Rang-badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/20 backdrop-blur-sm mb-3">
              <span className="text-base">{level.icon}</span>
              <span className="text-sm font-bold text-primary-400">{level.name}</span>
            </div>

            {/* Editorial headline */}
            <h1 className="text-2xl font-bold text-white text-center font-sans">
              Din Grønne Rejse
            </h1>
            <p className="text-sm text-neutral-400 text-center mt-1 max-w-xs">
              Du gør en reel forskel. Hvert km tæller for vores fælles fremtid.
            </p>
          </div>
        </div>
      </div>

      {/* ── Næste rang progress ── */}
      <Card variant="default" className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{level.icon}</span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              Næste rang: {level.name === "Klimahelt" ? "Mester" : ACHIEVEMENTS.find(a => a.threshold > co2Saved)?.name ?? "Klimahelt"}
            </span>
          </div>
          <span className="text-xs font-bold text-[var(--foreground)]">{progressToNext.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-primary-50 dark:bg-primary-900/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 animate-progress-fill shadow-[0_0_12px_rgba(255,140,66,0.4)]"
            style={{ "--progress-width": `${progressToNext}%`, width: `${progressToNext}%` } as React.CSSProperties}
          />
        </div>
      </Card>

      {/* ── Impact Metrikker — Kompakt 3-grid ── */}
      <div className="grid grid-cols-3 gap-3">
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <Card variant="default" className="p-4 text-center stagger-1 animate-fade-in-up">
              <TreePine size={20} strokeWidth={1.5} className="text-primary-600 mx-auto mb-2" />
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Plantede træer</p>
              <p className="text-xl font-bold text-[var(--foreground)] font-sans">{treesEquivalent} Træer</p>
            </Card>
            <Card variant="default" className="p-4 text-center stagger-2 animate-fade-in-up">
              <Car size={20} strokeWidth={1.5} className="text-primary-600 mx-auto mb-2" />
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Samkørsler i alt</p>
              <p className="text-xl font-bold text-[var(--foreground)] font-sans">{esg?.totalTrips ?? 0} Ture</p>
            </Card>
            <Card variant="default" className="p-4 text-center stagger-3 animate-fade-in-up">
              <Route size={20} strokeWidth={1.5} className="text-accent-600 mx-auto mb-2" />
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Total distance</p>
              <p className="text-xl font-bold text-[var(--foreground)] font-sans">{(esg?.totalDistanceKm ?? 0).toFixed(0)} km</p>
            </Card>
          </>
        )}
      </div>

      {/* ── Achievement Badges — Horisontal scroll ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 font-sans">
            <Award size={18} strokeWidth={1.5} className="text-accent-500" />
            Præstationer
          </h3>
          <span className="text-xs text-[var(--muted-foreground)]">Se alle</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {ACHIEVEMENTS.map((badge) => {
            const unlocked = co2Saved >= badge.threshold;
            const isCurrent = level.name === badge.name;
            const badgeProgress = unlocked ? 100 : (co2Saved / badge.threshold) * 100;

            return (
              <div key={badge.name} className="min-w-[140px] snap-start">
                <AchievementBadge
                  icon={badge.icon}
                  name={badge.name}
                  description={badge.desc}
                  unlocked={unlocked}
                  isCurrent={isCurrent}
                  progress={badgeProgress}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CO₂ Søjlediagram ── */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 font-sans">
            <BarChart3 size={18} strokeWidth={1.5} className="text-primary-500" />
            Månedlig CO₂-besparelse
          </h2>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
            Dit bidrag i {new Date().getFullYear()}
          </p>
        </CardHeader>
        <CardBody>
          <div className="flex items-end justify-between gap-3 h-48 pt-4">
            {monthlyData.map((item, i) => (
              <div
                key={item.month}
                className={`flex-1 flex flex-col items-center gap-2 stagger-${i + 1} animate-fade-in-up`}
              >
                {/* Værdi */}
                <span className="text-xs font-semibold text-[var(--muted-foreground)] tabular-nums">
                  {item.co2 > 0 ? `${item.co2.toFixed(0)}` : "—"}
                </span>

                {/* Søjle — Forest Green gradient */}
                <div className="w-full rounded-t-2xl relative overflow-hidden bg-neutral-100 dark:bg-neutral-800" style={{ height: "100%" }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-700 ease-out"
                    style={{
                      height: item.co2 > 0 ? `${Math.max((item.co2 / maxCo2) * 100, 8)}%` : "0%",
                    }}
                  />
                </div>

                {/* Måned */}
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── Illustreret Opsummeringskort ── */}
      <div className="relative overflow-hidden glass rounded-3xl p-8 shadow-[var(--shadow-ambient)]">
        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mx-auto shadow-lg">
            <Leaf size={32} strokeWidth={1.5} className="text-white animate-sway" />
          </div>
          <h3 className="text-lg font-bold text-[var(--foreground)] font-sans">
            Jeres miljøpåvirkning
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
            {co2Saved > 0 ? (
              <>
                I har samlet sparet <strong className="text-primary-600 dark:text-primary-400">{co2Saved.toFixed(1)} kg CO₂</strong> —
                det svarer til at plante{" "}
                <strong className="text-primary-600 dark:text-primary-400">
                  {treesEquivalent} træer
                </strong>{" "}
                🌳
              </>
            ) : (
              <>
                Start med at samkøre for at se jeres miljøpåvirkning her.
                Hver delt tur gør en forskel!
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}

export default function EsgPage() {
  return (
    <div className="space-y-6 animate-fade-in relative">
      <Suspense fallback={<div className="flex gap-3"><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></div>}>
        <EsgDashboardContent />
      </Suspense>
    </div>
  );
}
