"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, AlertTriangle, RefreshCw, Star } from "lucide-react";

const TIERS = ["free", "vip", "advocacy", "startup", "professional", "enterprise"];

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  org_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  last_login_at: string | null;
  vip_expires_at: string | null;
}

export function EditUserForm({ profile, currentUserId }: { profile: Profile; currentUserId: string }) {
  const router = useRouter();
  const isSelf = profile.id === currentUserId;

  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    role: profile.role ?? "free",
    org_name: profile.org_name ?? "",
    is_admin: profile.is_admin,
    is_active: profile.is_active,
    vip_expires_at: profile.vip_expires_at?.slice(0, 10) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Quick toggle between Free and VIP
  function toggleVip() {
    if (form.role === "vip") {
      update("role", "free");
    } else {
      update("role", "vip");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const payload: any = { ...form, id: profile.id };
    // Send null if no expiry date set
    payload.vip_expires_at = form.vip_expires_at ? new Date(form.vip_expires_at).toISOString() : null;

    const res = await fetch("/api/admin/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Save failed");
    } else {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete ${profile.email}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id }),
    });
    router.push("/admin");
  }

  async function handleResendLink() {
    setSendingLink(true);
    await fetch("/api/admin/users/resend-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email }),
    });
    setSendingLink(false);
    alert(`Magic link sent to ${profile.email}`);
  }

  return (
    <div className="space-y-4">
      {/* Read-only info */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-warm-400">Email</span>
          <span className="font-medium text-cannavec-900">{profile.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-400">Joined</span>
          <span className="font-mono text-xs text-warm-500">
            {new Date(profile.created_at).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-400">Last login</span>
          <span className="font-mono text-xs text-warm-500">
            {profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString("en-GB") : "Never"}
          </span>
        </div>
        {profile.stripe_customer_id && (
          <div className="flex justify-between">
            <span className="text-warm-400">Stripe ID</span>
            <span className="font-mono text-xs text-warm-500">{profile.stripe_customer_id}</span>
          </div>
        )}
      </div>

      {/* VIP quick toggle */}
      <div className="bg-white rounded-xl border border-amber-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className={`w-5 h-5 ${form.role === "vip" ? "text-amber-500 fill-amber-500" : "text-warm-300"}`} />
            <div>
              <p className="text-sm font-medium text-cannavec-800">VIP Access</p>
              <p className="text-xs text-warm-400">Free API &amp; MCP access for invited members</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleVip}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.role === "vip" ? "bg-amber-500" : "bg-warm-200"
            }`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.role === "vip" ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {form.role === "vip" && (
          <div className="mt-4 pt-4 border-t border-amber-100">
            <label className="block text-xs text-warm-400 mb-1">
              VIP expiry date <span className="text-warm-300">(leave blank for indefinite)</span>
            </label>
            <input
              type="date"
              value={form.vip_expires_at}
              onChange={(e) => update("vip_expires_at", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        )}
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-warm-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-cannavec-800 mb-1.5">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cannavec-800 mb-1.5">Tier</label>
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cannavec-500/30"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t === "vip" ? "VIP" : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
            Organisation <span className="text-warm-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.org_name}
            onChange={(e) => update("org_name", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-warm-100">
          <div>
            <p className="text-sm font-medium text-cannavec-800">Admin access</p>
            <p className="text-xs text-warm-400">Can access /admin dashboard</p>
          </div>
          <button
            type="button"
            disabled={isSelf}
            onClick={() => update("is_admin", !form.is_admin)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.is_admin ? "bg-cannavec-500" : "bg-warm-200"
            } disabled:opacity-40`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_admin ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-warm-100">
          <div>
            <p className="text-sm font-medium text-cannavec-800">Account active</p>
            <p className="text-xs text-warm-400">Suspended users cannot log in</p>
          </div>
          <button
            type="button"
            onClick={() => update("is_active", !form.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-cannavec-500" : "bg-warm-200"}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}
        {saved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">Changes saved.</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/admin" className="flex-1 cannavec-btn-secondary text-sm text-center !py-2.5">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 cannavec-btn-primary text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 space-y-3">
        <h3 className="text-sm font-medium text-cannavec-800">Actions</h3>
        <button
          onClick={handleResendLink}
          disabled={sendingLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-warm-200 text-sm text-warm-600 hover:bg-warm-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {sendingLink ? "Sending..." : "Resend magic link"}
        </button>
      </div>

      {/* Danger zone */}
      {!isSelf && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-medium text-red-700">Danger zone</h3>
          </div>
          <p className="text-xs text-warm-400 mb-4">
            Permanently deletes this account and all associated data. This cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting..." : "Delete account"}
          </button>
        </div>
      )}
    </div>
  );
}
