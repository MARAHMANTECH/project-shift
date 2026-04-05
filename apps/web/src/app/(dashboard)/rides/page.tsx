"use client";

import Link from "next/link";
import Image from "next/image";
import { useRides } from "@/hooks/use-rides";
import { Card } from "@/components/ui/card";
import { Badge, rideStatusLabel } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton";
import { PersonalityBadge } from "@/components/ui/personality-badge";
import { Car, Plus, Users } from "lucide-react";

// Tilfældige sociale badges for demo — i produktion fra brugerens profil
const DEMO_BADGES: Array<Array<"music" | "talkative" | "quiet" | "coffee" | "pet-friendly">> = [
  ["music", "talkative"],
  ["quiet", "coffee"],
  ["talkative", "pet-friendly"],
  ["music", "quiet"],
];

// Demo afdelinger
const DEMO_DEPARTMENTS = [
  "Digital Design Team",
  "Logistik & Supply",
  "HR Excellence",
  "Marketing & Brand",
];

export default function RidesPage() {
  const { data: rides, isLoading } = useRides();

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* ── Editorial Header — Stitch Koncept 2: "Find din næste tur" ── */}
      <div className="relative -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 overflow-hidden">
        <div className="relative w-full h-[200px] lg:h-[240px]">
          <Image
            src="/illustrations/community-ride.png"
            alt="Kollegaer der samkører i en grøn bil gennem et dansk kvarter"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/30 to-transparent" />
        </div>
        <div className="relative -mt-16 mx-4 lg:mx-6 z-10">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
            Dagens ture
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-sans">
            Find din næste tur
          </h1>
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : !rides || rides.length === 0 ? (
        /* Illustreret empty state */
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
            Ingen køreture endnu
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Vær den første til at oprette en køretur og spar CO₂ med dine kollegaer!
          </p>
          <Link href="/rides/new">
            <Button variant="cta" size="md">
              Opret den første tur
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {rides.map((ride, i) => {
            const status = rideStatusLabel(ride.status);
            const confirmedPassengers = ride.passengers.filter(
              (p) => p.status === "CONFIRMED"
            ).length;
            const departureDate = new Date(ride.departureTime);
            const badges = DEMO_BADGES[i % DEMO_BADGES.length];

            return (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card
                  variant="default"
                  className={`p-5 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer stagger-${Math.min(i + 1, 5)} animate-fade-in-up`}
                >
                  {/* Driver header med tid */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {ride.driver.firstName[0]}{ride.driver.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">
                          {ride.driver.firstName} {ride.driver.lastName}
                        </p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {DEMO_DEPARTMENTS[i % DEMO_DEPARTMENTS.length]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[var(--foreground)] tabular-nums font-sans">
                        {departureDate.toLocaleTimeString("da-DK", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        {departureDate.toLocaleDateString("da-DK", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Rute-visualisering */}
                  <div className="space-y-0.5 mb-3 ml-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary-500 shrink-0" />
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {ride.departurePoint.name}
                      </p>
                    </div>
                    <div className="ml-[5px] border-l-2 border-dashed border-primary-200 dark:border-primary-800 h-3" />
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-accent-500 shrink-0" />
                      <p className="text-sm text-[var(--muted-foreground)] truncate">
                        {ride.arrivalPoint.name}
                      </p>
                    </div>
                  </div>

                  {/* PersonalityBadges + passagerer + Tilmeld */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {badges.map((badge) => (
                      <PersonalityBadge key={badge} type={badge} />
                    ))}
                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 ml-auto">
                      <Users size={12} strokeWidth={1.5} />
                      {confirmedPassengers}/{ride.availableSeats}
                    </span>
                    <Badge variant={status.variant} label={status.label} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Orange FAB — "Opret tur" ── */}
      {rides && rides.length > 0 && (
        <Link
          href="/rides/new"
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            variant="cta"
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl h-14 px-6 gap-2"
          >
            <Plus size={20} strokeWidth={2} />
            Opret tur
          </Button>
        </Link>
      )}
    </div>
  );
}
