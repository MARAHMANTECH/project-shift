"use client";

// Feedback Triage — global admin view
import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Search, Bug, Lightbulb, Zap, CheckCircle2 } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  priority: string;
  isGlobal: boolean;
  createdAt: string;
  resolvedAt: string | null;
  user: { id: string; email: string; firstName: string; lastName: string } | null;
  organization: { id: string; name: string; slug: string } | null;
}

const statusFlow = ["NEW", "UNDER_REVIEW", "PLANNED", "IN_BUILD", "DONE"];
const statusLabels: Record<string, string> = { NEW: "Ny", UNDER_REVIEW: "Under review", PLANNED: "Planlagt", IN_BUILD: "I build", DONE: "Færdig" };
const statusColors: Record<string, string> = { NEW: "bg-amber-100 text-amber-700", UNDER_REVIEW: "bg-blue-100 text-blue-700", PLANNED: "bg-purple-100 text-purple-700", IN_BUILD: "bg-orange-100 text-orange-700", DONE: "bg-emerald-100 text-emerald-700" };
const typeIcons: Record<string, typeof Bug> = { BUG: Bug, FEATURE: Lightbulb, IMPROVEMENT: Zap };
const priorityColors: Record<string, string> = { LOW: "text-neutral-400", MEDIUM: "text-amber-500", HIGH: "text-red-500" };

export default function FeedbackTriagePage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data);
        setTotal(data.total);
      }
    } catch (e) {
      console.error("Failed to fetch feedback:", e);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, search, page]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  async function handleStatusChange(id: string, newStatus: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((f) => f.id === id ? { ...f, status: newStatus } : f));
      }
    } catch (e) {
      console.error("Failed to update:", e);
    }
  }

  async function handlePriorityChange(id: string, newPriority: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((f) => f.id === id ? { ...f, priority: newPriority } : f));
      }
    } catch (e) {
      console.error("Failed to update priority:", e);
    }
  }

  async function handleResolve(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve" }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((f) => f.id === id ? { ...f, status: "DONE" } : f));
      }
    } catch (e) {
      console.error("Failed to resolve:", e);
    }
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Feedback Triage</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{total} indmeldinger på tværs af alle organisationer</p>
      </div>

      {/* Pipeline Stats */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusFlow.map((s) => {
          const count = items.filter((f) => f.status === s).length;
          return (
            <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === s ? "ring-2 ring-offset-1 ring-black/20" : ""} ${statusColors[s]}`}>
              {statusLabels[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input type="text" placeholder="Søg titel/indhold..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }} />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}>
          <option value="">Alle typer</option>
          <option value="BUG">Fejl</option>
          <option value="FEATURE">Feature</option>
          <option value="IMPROVEMENT">Forbedring</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Ingen feedback fundet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const TypeIcon = typeIcons[item.type] ?? MessageSquare;
            return (
              <div key={item.id} className="p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.type === "BUG" ? "#FEF2F2" : item.type === "FEATURE" ? "#ECFDF5" : "#EFF6FF" }}>
                    <TypeIcon size={16} style={{ color: item.type === "BUG" ? "#EF4444" : item.type === "FEATURE" ? "#10B981" : "#3B82F6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{item.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[item.status]}`}>{statusLabels[item.status]}</span>
                      <span className={`text-[10px] font-bold ${priorityColors[item.priority]}`}>●  {item.priority}</span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{item.content}</p>
                    <p className="text-[10px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                      {item.user?.firstName} {item.user?.lastName} · {item.organization?.name ?? "—"} · {new Date(item.createdAt).toLocaleDateString("da-DK")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Status buttons */}
                    <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium outline-none" style={{ background: "var(--color-surface-base)" }}>
                      {statusFlow.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                    <select value={item.priority} onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium outline-none" style={{ background: "var(--color-surface-base)" }}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    {item.status !== "DONE" && (
                      <button onClick={() => handleResolve(item.id)} title="Marker som færdig"
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-30" style={{ background: "var(--color-surface-elevated)" }}>← Forrige</button>
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Side {page} af {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-30" style={{ background: "var(--color-surface-elevated)" }}>Næste →</button>
        </div>
      )}
    </AdminShell>
  );
}
