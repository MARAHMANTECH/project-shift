"use client";

// Audit Log Viewer — global sporbarhed
import { useState, useEffect, useCallback } from "react";
import { ScrollText, Search, Download, Filter } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string } | null;
  organization: { id: string; name: string; slug: string } | null;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity", entityFilter);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.data);
        setTotal(data.total);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs:", e);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityFilter, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function exportCsv(): void {
    const headers = ["Dato", "Bruger", "Action", "Entity", "Organisation"];
    const rows = entries.map((e) => [
      new Date(e.createdAt).toLocaleString("da-DK"),
      e.user?.email ?? "—",
      e.action,
      `${e.entity}:${e.entityId}`,
      e.organization?.name ?? "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const actionColors: Record<string, string> = {
    TENANT_CREATED: "bg-emerald-100 text-emerald-700",
    TENANT_UPDATED: "bg-blue-100 text-blue-700",
    TENANT_SOFT_DELETED: "bg-red-100 text-red-700",
    USER_ROLE_CHANGED: "bg-purple-100 text-purple-700",
    USER_ACTIVATED: "bg-emerald-100 text-emerald-700",
    USER_DEACTIVATED: "bg-red-100 text-red-700",
    USER_MOVED: "bg-amber-100 text-amber-700",
    LICENSE_UPDATED: "bg-blue-100 text-blue-700",
    FEEDBACK_UPDATED: "bg-blue-100 text-blue-700",
    FEEDBACK_RESOLVED: "bg-emerald-100 text-emerald-700",
    SSO_STATUS_CHANGED: "bg-purple-100 text-purple-700",
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Audit Log</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{total} handlinger registreret</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium hover:scale-105 transition-all"
          style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}>
          <Download size={14} /> Eksportér CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input type="text" placeholder="Filtrér action..." value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }} />
        </div>
        <input type="text" placeholder="Filtrér entity..." value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none min-w-[160px]"
          style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }} />
      </div>

      {/* Log Entries */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <ScrollText size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Ingen audit-log entries</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div key={entry.id}>
              <button
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-black/[0.02] transition-colors"
                style={{ background: "var(--color-surface-elevated)" }}
              >
                <span className="text-[10px] font-mono min-w-[130px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {new Date(entry.createdAt).toLocaleString("da-DK")}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${actionColors[entry.action] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {entry.action}
                </span>
                <span className="text-xs font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                  {entry.entity}
                </span>
                <span className="text-xs truncate ml-auto" style={{ color: "var(--color-text-tertiary)" }}>
                  {entry.user?.email ?? "—"} · {entry.organization?.name ?? "—"}
                </span>
              </button>
              {expandedId === entry.id && entry.metadata && (
                <div className="ml-[130px] pl-4 py-2">
                  <pre className="text-[11px] p-3 rounded-lg overflow-x-auto" style={{ background: "var(--color-surface-base)", color: "var(--color-text-secondary)" }}>
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
