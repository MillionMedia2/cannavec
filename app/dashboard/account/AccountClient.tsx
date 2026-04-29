"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Key, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Profile {
  fullName: string;
  email: string;
  orgName: string;
  role: string;
  isAdmin: boolean;
  createdAt: string;
}

const TIER_LABELS: Record<string, { label: string; class: string; features: string[] }> = {
  free: {
    label: "Free",
    class: "bg-warm-100 text-warm-600",
    features: ["Dashboard chatbot", "Knowledge Base browsing", "Basic Skills"],
  },
  vip: {
    label: "VIP",
    class: "bg-amber-100 text-amber-700",
    features: ["Everything in Free", "API key access", "MCP for Claude Desktop", "All MCP-eligible Skills"],
  },
  advocacy: {
    label: "Advocacy",
    class: "bg-cannavec-100 text-cannavec-700",
    features: ["Everything in Free", "API key access", "MCP for Claude Desktop", "Evidence grade filters"],
  },
  startup: {
    label: "Startup",
    class: "bg-blue-50 text-blue-700",
    features: ["Everything in Advocacy", "Product database access", "Higher query limits"],
  },
  professional: {
    label: "Professional",
    class: "bg-purple-50 text-purple-700",
    features: ["Everything in Startup", "Clinical summaries", "Dosing assistant", "Natural remedies"],
  },
  enterprise: {
    label: "Enterprise",
    class: "bg-amber-50 text-amber-700",
    features: ["Everything in Professional", "Custom integrations", "Dedicated support"],
  },
};

export function AccountClient({
  profile,
  activeKeyCount,
  canAccessApi,
}: {
  profile: Profile;
  activeKeyCount: number;
  canAccessApi: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: profile.fullName, orgName: profile.orgName });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tierInfo = TIER_LABELS[profile.role] ?? TIER_LABELS.free;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/account/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: form.fullName, org_name: form.orgName }),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch("/api/account/delete", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#f5f7f0] rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-[#8a9a5a]" />
        </div>
        <h1 className="font-display text-2xl text-cannavec-900">Account</h1>
      </div>

      {/* Profile section */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-cannavec-800 flex items-center gap-2">
          <User className="w-4 h-4" /> Profile
        </h2>

        <div>
          <label className="block text-xs text-warm-400 mb-1">Email</label>
          <p className="text-sm text-cannavec-900 font-medium">{profile.email}</p>
        </div>

        <div>
          <label className="block text-xs text-warm-400 mb-1">Full name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
          />
        </div>

        <div>
          <label className="block text-xs text-warm-400 mb-1">Organisation <span className="text-warm-300">(optional)</span></label>
          <input
            type="text"
            value={form.orgName}
            onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-warm-400">
          <Calendar className="w-3.5 h-3.5" />
          Member since {new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="cannavec-btn-primary text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved && <span className="text-xs text-green-600 self-center">Saved</span>}
        </div>
      </div>

      {/* Plan section */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-cannavec-800 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Your Plan
        </h2>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tierInfo.class}`}>
            {tierInfo.label}
          </span>
          {profile.isAdmin && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600">
              Admin
            </span>
          )}
        </div>

        <ul className="space-y-1.5">
          {tierInfo.features.map((f) => (
            <li key={f} className="text-xs text-warm-500 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#8a9a5a]" />
              {f}
            </li>
          ))}
        </ul>

        {profile.role === "free" && !profile.isAdmin && (
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-warm-100 text-warm-400 cursor-not-allowed"
          >
            Upgrade — Coming Soon
          </button>
        )}
      </div>

      {/* API Keys summary */}
      {canAccessApi && (
        <div className="bg-white rounded-xl border border-warm-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-cannavec-800 flex items-center gap-2">
            <Key className="w-4 h-4" /> API Keys
          </h2>
          <p className="text-xs text-warm-500">
            You have <span className="font-medium text-cannavec-900">{activeKeyCount}</span> active key{activeKeyCount !== 1 ? "s" : ""}.
          </p>
          <Link
            href="/dashboard/api-keys"
            className="inline-flex items-center gap-1.5 text-xs text-[#8a9a5a] font-medium hover:underline"
          >
            Manage keys <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-medium text-red-700">Danger zone</h3>
        </div>
        <p className="text-xs text-warm-400 mb-4">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete permanently"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs text-warm-400 hover:text-warm-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
