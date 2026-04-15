"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";

export default function NewTenantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    entraTenantId: "",
    entraGroupId: "",
  });
  const [emailDomains, setEmailDomains] = useState<string[]>([""]);
  const [domainInput, setDomainInput] = useState("");

  function handleSlugify(name: string): void {
    setForm((prev) => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }

  function addDomain(): void {
    const domain = domainInput.trim().toLowerCase();
    if (domain && !emailDomains.includes(domain)) {
      setEmailDomains([...emailDomains.filter(Boolean), domain]);
      setDomainInput("");
    }
  }

  function removeDomain(index: number): void {
    setEmailDomains(emailDomains.filter((_, i) => i !== index));
  }

  function handleDomainKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDomain();
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validDomains = emailDomains.filter(Boolean);
    if (validDomains.length === 0 && domainInput.trim()) {
      validDomains.push(domainInput.trim().toLowerCase());
    }

    if (validDomains.length === 0) {
      setError("Mindst ét email-domæne er påkrævet");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          emailDomains: validDomains,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Kunne ikke oprette organisation");
      }

      router.push("/admin/super/tenants");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukendt fejl");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    background: "var(--color-surface-elevated)",
    color: "var(--color-text-primary)",
    boxShadow: "var(--shadow-sm)",
  };

  const validDomains = emailDomains.filter(Boolean);

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/super/tenants" className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors">
            <ArrowLeft size={20} style={{ color: "var(--color-text-secondary)" }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Opret organisation</h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Onboard en ny kunde til Project SHIFT</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Grundlæggende</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>Organisationsnavn *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleSlugify(e.target.value)}
                placeholder="f.eks. Novo Nordisk A/S"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="novo-nordisk"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                style={inputStyle}
              />
            </div>

            {/* Multi-domæne input */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Email-domæner *
              </label>

              {/* Tilføjede domæner som chips */}
              {validDomains.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {validDomains.map((domain, idx) => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: "var(--color-primary-100)",
                        color: "var(--color-primary-700)",
                      }}
                    >
                      @{domain}
                      <button
                        type="button"
                        onClick={() => removeDomain(idx)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input + tilføj knap */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={handleDomainKeyDown}
                  placeholder="f.eks. novonordisk.com"
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={addDomain}
                  disabled={!domainInput.trim()}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                  style={{
                    background: "var(--color-primary-100)",
                    color: "var(--color-primary-700)",
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                Tilføj ét eller flere domæner. Medarbejdere med disse domæner tilknyttes automatisk.
                <br />
                Tryk <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-black/5">Enter</kbd> eller <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-black/5">,</kbd> for at tilføje.
              </p>
            </div>
          </div>

          {/* Entra ID */}
          <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--color-surface-elevated)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Microsoft Entra ID (valgfrit)</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>Entra Tenant ID</label>
              <input
                type="text"
                value={form.entraTenantId}
                onChange={(e) => setForm((p) => ({ ...p, entraTenantId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>Security Group ID</label>
              <input
                type="text"
                value={form.entraGroupId}
                onChange={(e) => setForm((p) => ({ ...p, entraGroupId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Kun brugere i denne gruppe får adgang (tom = alle i tenanten)</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-4 bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))" }}
          >
            <Plus size={16} />
            {isSubmitting ? "Opretter..." : "Opret organisation"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
