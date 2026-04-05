"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectInput, Input } from "@/components/ui/input";
import { SkeletonList } from "@/components/ui/skeleton";
import { PersonalityBadge } from "@/components/ui/personality-badge";
import { useMeetingPoints } from "@/hooks/use-meeting-points";
import { useMatchFinder, type MatchResult } from "@/hooks/use-match-finder";
import { Search, MapPin, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RideSearchPage() {
  const { data: meetingPoints } = useMeetingPoints();

  const [searchParams, setSearchParams] = useState<{
    latitude: number;
    longitude: number;
    departureTime: string;
  } | null>(null);

  const [selectedPointId, setSelectedPointId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  const { data: matches, isLoading, isFetched } = useMatchFinder(searchParams);

  const meetingPointOptions = (meetingPoints ?? []).map((mp) => ({
    value: mp.id,
    label: mp.name,
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const point = meetingPoints?.find((mp) => mp.id === selectedPointId);
    if (!point || !departureDate || !departureTime) return;

    setSearchParams({
      latitude: point.latitude,
      longitude: point.longitude,
      departureTime: new Date(
        `${departureDate}T${departureTime}:00`
      ).toISOString(),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto relative">
      {/* ── Shift Circle ── */}
      <div className="shift-circle shift-circle-md -top-8 -right-10 animate-drift" />

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/rides" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Search size={20} strokeWidth={1.5} className="text-primary-500" />
            Find køretur
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Søg efter samkørselsture nær dit afgangspunkt
          </p>
        </div>
      </div>

      {/* ── Conversational Search Form — surface-low container ── */}
      <div className="surface-low rounded-3xl p-6 lg:p-8">
        <form onSubmit={handleSearch} className="space-y-5" id="search-rides-form">
          <SelectInput
            id="search-point"
            label="Hvor vil du køre fra?"
            icon={<MapPin size={18} strokeWidth={1.5} />}
            placeholder="Vælg opsamlingspunkt..."
            options={meetingPointOptions}
            value={selectedPointId}
            onChange={(e) => setSelectedPointId(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="search-date"
              type="date"
              label="Hvilken dag?"
              icon={<Calendar size={18} strokeWidth={1.5} />}
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              id="search-time"
              type="time"
              label="Ønsket tid?"
              icon={<Clock size={18} strokeWidth={1.5} />}
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="cta" size="lg" fullWidth isLoading={isLoading}>
            <Search size={18} strokeWidth={1.5} />
            Søg efter ture
          </Button>
        </form>
      </div>

      {/* ── Resultater ── */}
      {isLoading && <SkeletonList count={3} />}

      {isFetched && matches && matches.length === 0 && (
        <EmptyState
          icon={<Search size={40} strokeWidth={1.5} className="text-neutral-400" />}
          title="Ingen ture fundet"
          description="Vi fandt ingen matchende ture i nærheden. Prøv at ændre tidspunktet eller opret din egen tur!"
          actionLabel="Opret tur i stedet"
          actionHref="/rides/new"
        />
      )}

      {matches && matches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[var(--foreground)]">
            🎯 {matches.length} {matches.length === 1 ? "match" : "matches"} fundet
          </h2>
          {matches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const scorePercent = Math.round(match.matchScore * 100);
  const departureDate = new Date(match.departureTime);

  return (
    <Link href={`/rides/${match.id}`}>
      <Card
        variant="default"
        className={`p-5 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer stagger-${Math.min(index + 1, 5)} animate-fade-in-up`}
      >
        <div className="flex items-start gap-4">
          {/* Driver avatar */}
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {match.driverFirstName[0]}{match.driverLastName[0]}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Tid + match score */}
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl font-bold text-[var(--foreground)] tabular-nums font-sans">
                {departureDate.toLocaleTimeString("da-DK", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  scorePercent >= 80
                    ? "bg-success/10 text-success"
                    : scorePercent >= 60
                    ? "bg-warning/10 text-warning"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                }`}
              >
                {scorePercent}% match
              </span>
            </div>

            {/* Rute-dots */}
            <div className="space-y-0.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary-500 shrink-0" />
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {match.departurePointName}
                </p>
              </div>
              <div className="ml-[5px] border-l-2 border-dashed border-primary-200 dark:border-primary-800 h-3" />
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-accent-500 shrink-0" />
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                  {match.arrivalPointName}
                </p>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--muted-foreground)]">
                {match.distanceMeters < 1000
                  ? `${match.distanceMeters}m væk`
                  : `${(match.distanceMeters / 1000).toFixed(1)}km væk`}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {match.timeDifferenceMinutes === 0
                  ? "⏱ Præcist match"
                  : `⏱ ±${match.timeDifferenceMinutes} min`}
              </span>
              <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 ml-auto">
                <Users size={12} strokeWidth={1.5} />
                {match.availableSeats} pladser
              </span>
            </div>
          </div>
        </div>

        {/* Match score visual bar */}
        <div className="mt-3 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              scorePercent >= 80
                ? "bg-success"
                : scorePercent >= 60
                ? "bg-warning"
                : "bg-neutral-400"
            }`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </Card>
    </Link>
  );
}
