// Feedback Modal — SoulEx-stylet modal til oprettelse af ny indmelding
// Per .rules/05-branding.md: Glassmorphism, min 16px radius, organisk design
// Per .rules/04-ui-ux.md: Store touch-targets, ingen standard browser-styles

"use client";

import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateFeedback } from "@/hooks/use-feedback";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS: Array<{
  value: "BUG" | "FEATURE" | "IMPROVEMENT";
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: "BUG",
    label: "Fejl",
    icon: "🐛",
    description: "Noget der ikke virker som forventet",
  },
  {
    value: "FEATURE",
    label: "Feature",
    icon: "✨",
    description: "En ny funktion du ønsker",
  },
  {
    value: "IMPROVEMENT",
    label: "Forbedring",
    icon: "⬆️",
    description: "Noget eksisterende der kan gøres bedre",
  },
];

const PRIORITY_OPTIONS: Array<{
  value: "LOW" | "MEDIUM" | "HIGH";
  label: string;
  color: string;
}> = [
  { value: "LOW", label: "Lav", color: "bg-neutral-200 text-neutral-600" },
  { value: "MEDIUM", label: "Medium", color: "bg-warning/10 text-warning" },
  { value: "HIGH", label: "Høj", color: "bg-error/10 text-error" },
];

function FeedbackModal({
  isOpen,
  onClose,
}: FeedbackModalProps): React.ReactElement | null {
  const [type, setType] = useState<"BUG" | "FEATURE" | "IMPROVEMENT">("FEATURE");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createFeedback = useCreateFeedback();

  // Reset form ved åbning
  useEffect(() => {
    if (isOpen) {
      setType("FEATURE");
      setPriority("MEDIUM");
      setTitle("");
      setContent("");
    }
  }, [isOpen]);

  // Luk ved Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createFeedback.mutate(
      { type, priority, title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[var(--foreground)]/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative w-full max-w-lg
          surface-lowest
          rounded-3xl
          shadow-[var(--shadow-elevated)]
          animate-scale-in
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            📮 Ny indmelding
          </h2>
          <button
            id="feedback-modal-close"
            onClick={onClose}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full surface-container
              text-[var(--muted-foreground)]
              hover:text-[var(--foreground)]
              hover:surface-high
              transition-all duration-200
              cursor-pointer
            "
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Type selector — pill-cards */}
          <div>
            <label className="text-sm font-semibold text-[var(--foreground)] mb-2.5 block">
              Hvad handler det om?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`
                    flex flex-col items-center gap-1.5 p-3
                    rounded-2xl text-center
                    transition-all duration-200
                    cursor-pointer
                    ${
                      type === option.value
                        ? "surface-container shadow-sm ring-2 ring-primary-500/20"
                        : "surface-low hover:surface-container"
                    }
                  `}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {option.label}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prioritet — pill-radios */}
          <div>
            <label className="text-sm font-semibold text-[var(--foreground)] mb-2.5 block">
              Prioritet
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-200
                    cursor-pointer
                    ${
                      priority === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-current/20`
                        : "surface-high text-[var(--muted-foreground)] hover:surface-highest"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titel */}
          <div>
            <label
              htmlFor="feedback-title"
              className="text-sm font-semibold text-[var(--foreground)] mb-2 block"
            >
              Kort beskrivelse
            </label>
            <input
              id="feedback-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. 'Søgefunktionen viser forkerte resultater'"
              required
              minLength={3}
              maxLength={200}
              className="
                w-full px-4 py-3
                rounded-2xl
                surface-container
                text-sm
                text-[var(--foreground)]
                placeholder:text-[var(--muted-foreground)]
                focus:outline-none focus:ring-2 focus:ring-primary-500/30
                transition-all duration-200
              "
            />
          </div>

          {/* Indhold */}
          <div>
            <label
              htmlFor="feedback-content"
              className="text-sm font-semibold text-[var(--foreground)] mb-2 block"
            >
              Detaljeret beskrivelse
            </label>
            <textarea
              id="feedback-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Beskriv hvad der sker, hvad du forventede, og eventuelle trin til at genskabe problemet..."
              required
              minLength={10}
              rows={4}
              className="
                w-full px-4 py-3
                rounded-2xl
                surface-container
                text-sm
                text-[var(--foreground)]
                placeholder:text-[var(--muted-foreground)]
                focus:outline-none focus:ring-2 focus:ring-primary-500/30
                transition-all duration-200
                resize-none
              "
            />
          </div>

          {/* Submit */}
          <Button
            id="feedback-submit"
            type="submit"
            variant="forest"
            size="lg"
            fullWidth
            isLoading={createFeedback.isPending}
            disabled={!title.trim() || !content.trim() || content.trim().length < 10}
          >
            <Send size={16} strokeWidth={2} />
            Send indmelding
          </Button>
        </form>
      </div>
    </div>
  );
}

export { FeedbackModal };
