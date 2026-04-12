"use client";

import { useSession } from "next-auth/react";

import Link from "next/link";
import Image from "next/image";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { useRides } from "@/hooks/use-rides";
import { useEsgSummary } from "@/hooks/use-esg";
import { Badge, rideStatusLabel } from "@/components/ui/badge";
import { AppShell } from "@/components/shell/app-shell";
import { Car, Search, Leaf, Route, Users, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const { data: rides, isLoading: ridesLoading } = useRides();
  const { data: esg, isLoading: esgLoading } = useEsgSummary();

  // Tidspunktsbaseret hilsen
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Godmorgen" : hour < 18 ? "Goddag" : "Godaften";

  const activeRides = rides?.filter((r) => r.status === "SCHEDULED") ?? [];
  const totalPassengers = rides?.reduce(
    (sum, r) => sum + r.passengers.filter((p) => p.status === "CONFIRMED").length,
    0
  ) ?? 0;

  const co2Saved = esg?.totalCo2SavedKg ?? 0;
  const treesEquivalent = Math.ceil(co2Saved / 22);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* ── Illustrated Hero — GoMore-inspireret kunstværk ── */}
        <div className="relative -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 overflow-hidden">
          {/* Panoramisk landskabsillustration */}
          <div className="relative w-full h-[280px] lg:h-[340px]">
            <Image
              src="/illustrations/hero-landscape.png"
              alt="Dansk landskab med samkørende biler, vindmøller og fællesskab"
              fill
              priority
              className="object-cover object-bottom"
              sizes="100vw"
            />
            {/* Gradient overlay — kunst fader  ind i warm sands baggrund */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent" />
          </div>

          {/* Svævende velkomstkort — oven på illustrationen */}
          <div className="relative -mt-20 mx-4 lg:mx-6 z-10">
            <div className="glass rounded-3xl p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                    {greeting}
                  </p>
                  <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
                    {session?.user?.name?.split(" ")[0] ?? "der"} 👋
                  </h1>
                </div>

                {/* CO₂ badge */}
                {co2Saved > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20">
                    <Leaf size={14} strokeWidth={1.5} className="text-primary-600" />
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                      {co2Saved.toFixed(1)} kg CO₂
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Gør en forskel på din vej i dag 🌱
              </p>
            </div>
          </div>
        </div>

        {/* ── KPI Cards — 2×2 grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {ridesLoading || esgLoading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <StatCard
                icon={<Car size={20} strokeWidth={1.5} className="text-primary-600 dark:text-primary-400" />}
                value={activeRides.length}
                label="Aktive køreture"
                accentColor="green"
                className="stagger-1 animate-fade-in-up"
              />
              <StatCard
                icon={<Users size={20} strokeWidth={1.5} className="text-primary-600 dark:text-primary-400" />}
                value={totalPassengers}
                label="Passagerer"
                accentColor="green"
                className="stagger-2 animate-fade-in-up"
              />
              <StatCard
                icon={<Leaf size={20} strokeWidth={1.5} className="text-primary-600 dark:text-primary-400" />}
                value={`${co2Saved.toFixed(1)} kg`}
                label="CO₂ sparet"
                accentColor="green"
                className="stagger-3 animate-fade-in-up"
              />
              <StatCard
                icon={<Route size={20} strokeWidth={1.5} className="text-accent-600 dark:text-accent-400" />}
                value={`${(esg?.totalDistanceKm ?? 0).toFixed(0)} km`}
                label="Delte km"
                accentColor="orange"
                className="stagger-4 animate-fade-in-up"
              />
            </>
          )}
        </div>

        {/* ── Quick Actions — Stitch Koncept 1: Runde gradient-ikoner ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/rides/new">
            <Card variant="default" className="p-5 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <CardBody className="!p-0 flex flex-col items-center gap-3 text-center">
                <div className="h-16 w-16 rounded-3xl gradient-cta flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Car size={28} strokeWidth={1.5} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">Opret tur</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Tilbyd din køretur</p>
                </div>
              </CardBody>
            </Card>
          </Link>
          <Link href="/rides/search">
            <Card variant="default" className="p-5 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <CardBody className="!p-0 flex flex-col items-center gap-3 text-center">
                <div className="h-16 w-16 rounded-3xl gradient-forest flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Search size={28} strokeWidth={1.5} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">Find tur</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Søg i nærheden</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>

        {/* ── Kommende Køreture — Editorial header ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--foreground)] font-sans">
              Kommende køreture
            </h2>
            <Link
              href="/rides"
              className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline uppercase tracking-wider"
            >
              Se alle
            </Link>
          </div>

          {activeRides.length === 0 ? (
            /* Illustreret empty state — Ventende bil */
            <Card variant="surface" className="p-8 text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Image
                  src="/illustrations/empty-state-car.png"
                  alt="En grøn bil venter på en tur"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                Ingen planlagte ture endnu
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Opret en tur eller find en at tilmelde dig!
              </p>
              <Link href="/rides/new">
                <Button variant="cta" size="md">
                  Opret din første tur
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeRides.slice(0, 3).map((ride, i) => {
                const status = rideStatusLabel(ride.status);
                return (
                  <Link key={ride.id} href={`/rides/${ride.id}`}>
                    <Card
                      variant="default"
                      className={`p-4 lg:p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer stagger-${i + 1} animate-fade-in-up`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                            {ride.driver.firstName[0]}{ride.driver.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">
                              Køretur
                            </p>
                            <p className="text-sm font-bold text-[var(--foreground)] truncate">
                              {ride.departurePoint.name} → {ride.arrivalPoint.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[var(--muted-foreground)]">
                                🕐 {new Date(ride.departureTime).toLocaleString("da-DK", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                👥 {ride.passengers.filter((p) => p.status === "CONFIRMED").length}/{ride.availableSeats}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={status.variant} label={status.label} />
                          <ChevronRight size={16} className="text-[var(--muted-foreground)]" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
