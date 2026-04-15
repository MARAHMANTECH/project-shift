"use client";

// Licensoversigt — alle organisationers licensstatus
import { useState, useEffect } from "react";
import { CreditCard, Users, AlertTriangle } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface LicenseItem {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  license: { id: string; tier: string; maxUsers: number; expiresAt: string | null; notes: string | null } | null;
  currentUsers: number;
  usagePercent: number;
}

const tierColors: Record<string, { bg: string; text: string; bar: string }> = {
  TRIAL: { bg: "bg-amber-50", text: "text-amber-700", bar: "#F59E0B" },
  STARTER: { bg: "bg-blue-50", text: "text-blue-700", bar: "#3B82F6" },
  PROFESSIONAL: { bg: "bg-purple-50", text: "text-purple-700", bar: "#8B5CF6" },
  ENTERPRISE: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "#10B981" },
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTier, setEditTier] = useState("");
  const [editMaxUsers, setEditMaxUsers] = useState(50);

  useEffect(() => { fetchLicenses(); }, []);

  async function fetchLicenses(): Promise<void> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/licenses");
      if (res.ok) setLicenses(await res.json());
    } catch (e) {
      console.error("Failed to fetch licenses:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(orgId: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/licenses/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: editTier, maxUsers: editMaxUsers }),
      });
      if (res.ok) {
        await fetchLicenses();
        setEditingId(null);
      }
    } catch (e) {
      console.error("Failed to update license:", e);
    }
  }

  function startEdit(item: LicenseItem): void {
    setEditingId(item.organizationId);
    setEditTier(item.license?.tier ?? "TRIAL");
    setEditMaxUsers(item.license?.maxUsers ?? 50);
  }

  const expiringSoon = licenses.filter((l) => {
    if (!l.license?.expiresAt) return false;
    const days = (new Date(l.license.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days > 0 && days < 30;
  });

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Licenser</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Licensoversigt for {licenses.length} organisationer</p>
      </div>

      {/* Warning for expiring */}
      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 bg-amber-50">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{expiringSoon.length}</strong> {expiringSoon.length === 1 ? "licens udløber" : "licenser udløber"} inden for 30 dage
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"].map((tier) => {
          const count = licenses.filter((l) => l.license?.tier === tier).length;
          const tc = tierColors[tier];
          return (
            <div key={tier} className={`p-4 rounded-2xl ${tc?.bg ?? ""}`}>
              <span className={`text-xs font-bold ${tc?.text ?? ""}`}>{tier}</span>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--color-text-primary)" }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* License List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />)}</div>
      ) : (
        <div className="space-y-2">
          {licenses.map((item) => {
            const tc = tierColors[item.license?.tier ?? "TRIAL"] ?? tierColors.TRIAL;
            const isEditing = editingId === item.organizationId;

            return (
              <div key={item.organizationId} className="p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{item.organizationName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tc.bg} ${tc.text}`}>
                        {item.license?.tier ?? "NONE"}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {item.organizationSlug} · {item.currentUsers}/{item.license?.maxUsers ?? "∞"} brugere
                      {item.license?.expiresAt && ` · Udløber ${new Date(item.license.expiresAt).toLocaleDateString("da-DK")}`}
                    </p>
                  </div>

                  {/* Usage bar */}
                  <div className="w-24 hidden lg:block">
                    <div className="h-2 rounded-full" style={{ background: "var(--color-surface-base)" }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(100, item.usagePercent)}%`,
                        background: item.usagePercent > 90 ? "#EF4444" : tc.bar,
                      }} />
                    </div>
                    <p className="text-[10px] mt-1 text-right" style={{ color: "var(--color-text-tertiary)" }}>{item.usagePercent}%</p>
                  </div>

                  <button onClick={() => isEditing ? setEditingId(null) : startEdit(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 transition-colors"
                    style={{ color: "var(--color-primary-600)" }}>
                    {isEditing ? "Annullér" : "Redigér"}
                  </button>
                </div>

                {/* Edit Form */}
                {isEditing && (
                  <div className="mt-4 pt-4 flex items-end gap-3" style={{ borderTop: "1px solid var(--color-surface-base)" }}>
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>Tier</label>
                      <select value={editTier} onChange={(e) => setEditTier(e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "var(--color-surface-base)" }}>
                        <option value="TRIAL">Trial</option>
                        <option value="STARTER">Starter</option>
                        <option value="PROFESSIONAL">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--color-text-secondary)" }}>Max brugere</label>
                      <input type="number" value={editMaxUsers} onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                        className="px-3 py-2 rounded-lg text-xs outline-none w-24" style={{ background: "var(--color-surface-base)" }} />
                    </div>
                    <button onClick={() => handleSave(item.organizationId)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "var(--color-primary-500)" }}>
                      Gem
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
