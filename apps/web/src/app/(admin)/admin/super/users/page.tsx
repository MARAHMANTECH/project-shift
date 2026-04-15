"use client";

// Global brugerstyring — cross-tenant brugerliste med rolleændring
import { useState, useEffect, useCallback } from "react";
import { Users, Search, Shield, ShieldCheck, User, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { AdminShell } from "../components/admin-shell";

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  organization: { id: string; name: string; slug: string };
}

const roleOptions = [
  { value: "MEMBER", label: "Member", icon: User, color: "#6B7280" },
  { value: "ORG_ADMIN", label: "Org Admin", icon: ShieldCheck, color: "#8B5CF6" },
  { value: "SUPER_ADMIN", label: "Super Admin", icon: Shield, color: "#EF4444" },
];

const roleBadge: Record<string, string> = {
  MEMBER: "bg-neutral-100 text-neutral-600",
  ORG_ADMIN: "bg-purple-100 text-purple-700",
  SUPER_ADMIN: "bg-red-100 text-red-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("isActive", statusFilter);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data);
        setTotal(data.total);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string): Promise<void> {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changeRole", role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        alert(data.error ?? "Fejl ved rolleændring");
      }
    } catch (e) {
      console.error("Failed to change role:", e);
    } finally {
      setActionLoading(null);
      setEditingRole(null);
    }
  }

  async function handleToggleStatus(userId: string): Promise<void> {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleStatus" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: updated.isActive } : u));
      } else {
        const data = await res.json();
        alert(data.error ?? "Fejl ved statusændring");
      }
    } catch (e) {
      console.error("Failed to toggle status:", e);
    } finally {
      setActionLoading(null);
    }
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>Brugere</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          {total} brugere på tværs af alle organisationer
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            placeholder="Søg navn, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}
        >
          <option value="">Alle roller</option>
          <option value="MEMBER">Member</option>
          <option value="ORG_ADMIN">Org Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-primary)" }}
        >
          <option value="">Alle statusser</option>
          <option value="true">Aktive</option>
          <option value="false">Inaktive</option>
        </select>
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--color-surface-elevated)" }} />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--color-surface-elevated)" }}>
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Ingen brugere fundet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
              {/* Avatar */}
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${user.isActive ? "" : "opacity-40"}`}
                style={{ background: "linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))", color: "var(--color-primary-700)" }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold truncate ${!user.isActive ? "opacity-50" : ""}`} style={{ color: "var(--color-text-primary)" }}>
                    {user.firstName} {user.lastName}
                  </p>
                  {!user.isActive && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">INAKTIV</span>}
                </div>
                <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
                  {user.email} · {user.organization.name}
                </p>
              </div>

              {/* Role Dropdown */}
              <div className="relative">
                {editingRole === user.id ? (
                  <div className="absolute right-0 top-0 z-10 rounded-xl p-1 shadow-xl min-w-[160px]" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-surface-base)" }}>
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleRoleChange(user.id, opt.value)}
                        disabled={actionLoading === user.id}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium hover:bg-black/5 transition-colors"
                        style={{ color: user.role === opt.value ? opt.color : "var(--color-text-primary)" }}
                      >
                        <opt.icon size={14} />
                        {opt.label}
                        {user.role === opt.value && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                    <button onClick={() => setEditingRole(null)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:bg-black/5">
                      <X size={14} /> Annullér
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingRole(user.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 hover:scale-105 transition-all ${roleBadge[user.role] ?? ""}`}
                  >
                    {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : null}
                    {user.role}
                    <ChevronDown size={10} />
                  </button>
                )}
              </div>

              {/* Status Toggle */}
              <button
                onClick={() => handleToggleStatus(user.id)}
                disabled={actionLoading === user.id}
                className={`h-6 w-11 rounded-full relative transition-colors ${user.isActive ? "bg-emerald-500" : "bg-neutral-300"}`}
                title={user.isActive ? "Deaktivér" : "Aktivér"}
              >
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${user.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-30"
            style={{ background: "var(--color-surface-elevated)" }}>← Forrige</button>
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Side {page} af {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-30"
            style={{ background: "var(--color-surface-elevated)" }}>Næste →</button>
        </div>
      )}
    </AdminShell>
  );
}
