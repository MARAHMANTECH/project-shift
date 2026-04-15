"use client";

// Changelog Admin — Opret, redigér, publicér, slet
import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Eye, EyeOff, Trash2, X, Loader2 } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface ChangelogItem {
  id: string;
  versionBuild: number;
  type: string;
  title: string;
  description: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  FEATURE: "bg-emerald-100 text-emerald-700",
  FIX: "bg-red-100 text-red-700",
  IMPROVEMENT: "bg-blue-100 text-blue-700",
};

export default function ChangelogAdminPage() {
  const [items, setItems] = useState<ChangelogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ versionBuild: 0, type: "FEATURE" as string, title: "", description: "", isPublished: false });
  const [saving, setSaving] = useState(false);

  const fetchChangelogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (publishedFilter) params.set("isPublished", publishedFilter);

      const res = await fetch(`/api/admin/changelog?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data);
        setTotal(data.total);
      }
    } catch (e) {
      console.error("Failed to fetch changelogs:", e);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, publishedFilter]);

  useEffect(() => { fetchChangelogs(); }, [fetchChangelogs]);

  function resetForm(): void {
    setFormData({ versionBuild: 0, type: "FEATURE", title: "", description: "", isPublished: false });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: ChangelogItem): void {
    setFormData({
      versionBuild: item.versionBuild,
      type: item.type,
      title: item.title,
      description: item.description,
      isPublished: item.isPublished,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleSave(): Promise<void> {
    if (!formData.title || !formData.description || !formData.versionBuild) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/changelog/${editingId}` : "/api/admin/changelog";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchChangelogs();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save changelog:", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/changelog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "togglePublish" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, isPublished: updated.isPublished, publishedAt: updated.publishedAt } : i));
      }
    } catch (e) {
      console.error("Failed to toggle publish:", e);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Er du sikker på du vil slette denne changelog-entry?")) return;
    try {
      const res = await fetch(`/api/admin/changelog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete changelog:", e);
    }
  }

  const inputStyle = { background: "var(--color-surface-base)", color: "var(--color-text-primary)" };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Changelog</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{total} entries — Opret og administrér versionsopdateringer</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          style={{ background: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))" }}>
          <Plus size={16} /> Ny entry
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-md)", border: "2px solid var(--color-primary-200)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              {editingId ? "Redigér Changelog" : "Ny Changelog Entry"}
            </h2>
            <button onClick={resetForm}><X size={18} style={{ color: "var(--color-text-tertiary)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>Build-nummer</label>
              <input type="number" value={formData.versionBuild || ""} onChange={(e) => setFormData({ ...formData, versionBuild: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="f.eks. 42" />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="FEATURE">Feature</option>
                <option value="FIX">Fix</option>
                <option value="IMPROVEMENT">Forbedring</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>Titel</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Hvad er nyt?" />
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>Beskrivelse</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} placeholder="Detaljeret beskrivelse..." />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--color-text-primary)" }}>
              <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="rounded" />
              Publicér med det samme
            </label>
            <button onClick={handleSave} disabled={saving || !formData.title || !formData.description || !formData.versionBuild}
              className="px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: "var(--color-primary-500)" }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Opdatér" : "Opret"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}>
          <option value="">Alle typer</option>
          <option value="FEATURE">Feature</option>
          <option value="FIX">Fix</option>
          <option value="IMPROVEMENT">Forbedring</option>
        </select>
        <select value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}>
          <option value="">Alle</option>
          <option value="true">Publicerede</option>
          <option value="false">Upublicerede</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Ingen changelog entries</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className={`p-4 rounded-2xl ${!item.isPublished ? "border-2 border-dashed" : ""}`}
              style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)", borderColor: !item.isPublished ? "var(--color-text-tertiary)" : undefined, opacity: item.isPublished ? 1 : 0.7 }}>
              <div className="flex items-start gap-3">
                <div className="text-center flex-shrink-0">
                  <p className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>#{item.versionBuild}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{item.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[item.type] ?? ""}`}>{item.type}</span>
                    {!item.isPublished && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-500">DRAFT</span>}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{item.description}</p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Oprettet {new Date(item.createdAt).toLocaleDateString("da-DK")}
                    {item.publishedAt && ` · Publiceret ${new Date(item.publishedAt).toLocaleDateString("da-DK")}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleTogglePublish(item.id)} title={item.isPublished ? "Afpublicér" : "Publicér"}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors">
                    {item.isPublished ? <EyeOff size={14} style={{ color: "var(--color-text-tertiary)" }} /> : <Eye size={14} className="text-emerald-500" />}
                  </button>
                  <button onClick={() => startEdit(item)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-black/5" style={{ color: "var(--color-primary-600)" }}>
                    Redigér
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
