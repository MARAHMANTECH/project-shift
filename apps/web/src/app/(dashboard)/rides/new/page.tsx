"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, SelectInput, TextareaInput } from "@/components/ui/input";
import { useMeetingPoints } from "@/hooks/use-meeting-points";
import { useCreateRide } from "@/hooks/use-rides";
import { SkeletonCard } from "@/components/ui/skeleton";
import { MapPin, Flag, Calendar, Clock, Armchair, Car, ArrowLeft, Leaf } from "lucide-react";

export default function NewRidePage() {
  const router = useRouter();
  const { data: meetingPoints, isLoading } = useMeetingPoints();
  const createRide = useCreateRide();

  const [form, setForm] = useState({
    departurePointId: "",
    arrivalPointId: "",
    departureDate: "",
    departureTime: "",
    availableSeats: 3,
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.departurePointId === form.arrivalPointId) {
      setError("Afgangspunkt og ankomstpunkt kan ikke være ens.");
      return;
    }

    const departureTime = new Date(
      `${form.departureDate}T${form.departureTime}:00`
    ).toISOString();

    try {
      await createRide.mutateAsync({
        departurePointId: form.departurePointId,
        arrivalPointId: form.arrivalPointId,
        departureTime,
        availableSeats: form.availableSeats,
        notes: form.notes || undefined,
      });
      router.push("/rides");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Der opstod en fejl. Prøv igen."
      );
    }
  };

  const meetingPointOptions = (meetingPoints ?? []).map((mp) => ({
    value: mp.id,
    label: `${mp.name} — ${mp.address}`,
  }));

  const seatOptions = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    value: String(n),
    label: `${n} ${n === 1 ? "plads" : "pladser"}`,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
        <h1 className="text-xl font-bold">Opret ny køretur</h1>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto relative">
      {/* ── Shift Circle ── */}
      <div className="shift-circle shift-circle-md -top-10 -right-8 animate-drift" />

      {/* ── Header — med tilbage-knap ── */}
      <div className="flex items-center gap-3">
        <Link href="/rides" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Opret ny køretur
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Del din tur og spar CO₂ med kollegaerne 🌱
          </p>
        </div>
      </div>

      {/* ── Conversational Form — Dialog-stil med organisk flow ── */}
      <div className="surface-low rounded-3xl p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" id="create-ride-form">
          {/* Afgang */}
          <SelectInput
            id="departure-point"
            label="Hvor kører du fra?"
            icon={<MapPin size={18} strokeWidth={1.5} />}
            placeholder="Vælg afgangspunkt..."
            options={meetingPointOptions}
            value={form.departurePointId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, departurePointId: e.target.value }))
            }
            required
          />

          {/* Ankomst */}
          <SelectInput
            id="arrival-point"
            label="Hvor skal du hen?"
            icon={<Flag size={18} strokeWidth={1.5} />}
            placeholder="Vælg ankomstpunkt..."
            options={meetingPointOptions}
            value={form.arrivalPointId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, arrivalPointId: e.target.value }))
            }
            required
          />

          {/* Dato + Tid */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="departure-date"
              type="date"
              label="Hvilken dag?"
              icon={<Calendar size={18} strokeWidth={1.5} />}
              value={form.departureDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, departureDate: e.target.value }))
              }
              required
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              id="departure-time"
              type="time"
              label="Hvornår?"
              icon={<Clock size={18} strokeWidth={1.5} />}
              value={form.departureTime}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, departureTime: e.target.value }))
              }
              required
            />
          </div>

          {/* Pladser */}
          <SelectInput
            id="available-seats"
            label="Hvor mange kan du tage med?"
            icon={<Armchair size={18} strokeWidth={1.5} />}
            options={seatOptions}
            value={String(form.availableSeats)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                availableSeats: Number(e.target.value),
              }))
            }
          />

          {/* Bemærkninger */}
          <TextareaInput
            id="notes"
            label="Bemærkninger (valgfrit)"
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            maxLength={500}
            rows={3}
            placeholder="F.eks. 'Mødes ved indgangen', 'Har plads til bagage'..."
          />

          {/* Fejlbesked */}
          {error && (
            <div className="p-4 rounded-2xl bg-error/10 text-error text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA — Orange gradient, pill */}
          <Button
            type="submit"
            variant="cta"
            size="lg"
            fullWidth
            isLoading={createRide.isPending}
          >
            <Car size={20} strokeWidth={1.5} />
            Opret køretur
          </Button>
        </form>
      </div>

      {/* ── CO₂ Impact Preview — Gamification ved formularens bund ── */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
          <Leaf size={18} strokeWidth={1.5} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Gør en forskel
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            🌱 Denne tur sparer ca. 3.2 kg CO₂
          </p>
        </div>
      </div>
    </div>
  );
}
