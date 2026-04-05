"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRide, useJoinRide, useLeaveRide } from "@/hooks/use-rides";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, rideStatusLabel } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ArrowLeft, Car, MapPin, Clock, Armchair, StickyNote, Users, UserPlus, UserMinus } from "lucide-react";

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ride, isLoading, error } = useRide(id);
  const joinRide = useJoinRide();
  const leaveRide = useLeaveRide();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-neutral-100 dark:bg-neutral-800 mb-4">
          <Car size={36} strokeWidth={1.5} className="text-neutral-400" />
        </div>
        <p className="text-lg font-bold text-[var(--foreground)]">
          Køretur ikke fundet
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
          Turen eksisterer muligvis ikke, eller du har ikke adgang.
        </p>
        <Link href="/rides">
          <Button variant="secondary">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Tilbage til køreture
          </Button>
        </Link>
      </div>
    );
  }

  const status = rideStatusLabel(ride.status);
  const confirmedPassengers = ride.passengers.filter(
    (p) => p.status === "CONFIRMED"
  );
  const departureDate = new Date(ride.departureTime);

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      {/* Back link */}
      <Link
        href="/rides"
        className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Alle køreture
      </Link>

      {/* Route Card */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <Car size={20} strokeWidth={1.5} className="text-primary-500" />
              Køretur
            </h1>
            <Badge variant={status.variant} label={status.label} />
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Route visualization */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-3.5 rounded-full bg-primary-500 shrink-0 shadow-sm" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {ride.departurePoint.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {ride.departurePoint.address}
                </p>
              </div>
            </div>
            <div className="ml-[7px] border-l-2 border-dashed border-neutral-200 dark:border-neutral-700 h-6" />
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-3.5 rounded-full bg-accent-500 shrink-0 shadow-sm" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {ride.arrivalPoint.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {ride.arrivalPoint.address}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)]" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={14} strokeWidth={1.5} className="text-[var(--muted-foreground)]" />
                <p className="text-xs text-[var(--muted-foreground)]">Afgang</p>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {departureDate.toLocaleDateString("da-DK", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                {departureDate.toLocaleTimeString("da-DK", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Armchair size={14} strokeWidth={1.5} className="text-[var(--muted-foreground)]" />
                <p className="text-xs text-[var(--muted-foreground)]">Ledige pladser</p>
              </div>
              <p className="text-xl font-bold text-[var(--foreground)]">
                {ride.availableSeats - confirmedPassengers.length} <span className="text-sm font-normal text-[var(--muted-foreground)]">af {ride.availableSeats}</span>
              </p>
            </div>
          </div>

          {ride.notes && (
            <>
              <div className="border-t border-[var(--border)]" />
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <StickyNote size={14} strokeWidth={1.5} className="text-[var(--muted-foreground)]" />
                  <p className="text-xs text-[var(--muted-foreground)]">Bemærkninger</p>
                </div>
                <p className="text-sm text-[var(--foreground)]">{ride.notes}</p>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Driver Card */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {ride.driver.firstName[0]}{ride.driver.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {ride.driver.firstName} {ride.driver.lastName}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Chauffør
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Passengers */}
      <Card variant="outlined">
        <CardHeader>
          <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <Users size={18} strokeWidth={1.5} className="text-primary-500" />
            Passagerer ({confirmedPassengers.length})
          </h2>
        </CardHeader>
        <CardBody>
          {confirmedPassengers.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
              Ingen passagerer tilmeldt endnu — vær den første! 🙌
            </p>
          ) : (
            <div className="space-y-3">
              {confirmedPassengers.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    {p.user.firstName[0]}{p.user.lastName[0]}
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {p.user.firstName} {p.user.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Action buttons */}
      {ride.status === "SCHEDULED" && (
        <div className="flex gap-3">
          <Button
            variant="cta"
            size="lg"
            fullWidth
            isLoading={joinRide.isPending}
            onClick={() => joinRide.mutate(ride.id)}
          >
            <UserPlus size={18} strokeWidth={1.5} />
            Tilmeld mig
          </Button>
          <Button
            variant="ghost"
            size="lg"
            isLoading={leaveRide.isPending}
            onClick={() => leaveRide.mutate(ride.id)}
          >
            <UserMinus size={16} strokeWidth={1.5} />
            Afmeld
          </Button>
        </div>
      )}
    </div>
  );
}
