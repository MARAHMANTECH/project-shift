import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="animate-fade-in">
      <EmptyState
        icon={<Users size={40} strokeWidth={1.5} className="text-primary-500" />}
        title="Fællesskab — Kommer snart!"
        description="Her kan du oprette og deltage i virksomhedsevents, netværksmøder og sociale aktiviteter med dine kollegaer. Modulet er under udvikling."
      />
    </div>
  );
}
