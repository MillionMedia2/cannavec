"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";

const ROLES = ["free", "advocacy", "startup", "professional", "enterprise"];
const USER_ROLES = ["Patient", "Doctor", "Researcher", "Developer", "Other"];

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    userRole: "",
    tier: "free",
    org: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        full_name: form.fullName,
        role: form.tier,
        user_role: form.userRole.toLowerCase(),
        org_name: form.org || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-warm-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl text-cannavec-900 mb-2">User created</h2>
          <p className="text-warm-500 text-sm mb-6">
            A magic link has been sent to <strong>{form.email}</strong>.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setDone(false); setForm({ fullName: "", email: "", userRole: "", tier: "free", org: "" }); }}
              className="cannavec-btn-secondary text-sm !py-2 !px-4"
            >
              Add another
            </button>
            <Link href="/admin" className="cannavec-btn-primary text-sm !py-2 !px-4">
              Back to members
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-cannavec-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
            <span className="text-white font-mono text-xs font-bold">cv</span>
          </div>
          <span className="font-display text-lg">cannavec.ai</span>
          <span className="text-white/40 text-sm">/ Admin / New user</span>
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        <h1 className="font-display text-2xl text-cannavec-900 mb-6">Create user</h1>

        <div className="bg-white rounded-xl border border-warm-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cannavec-800 mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cannavec-800 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cannavec-800 mb-1.5">Role</label>
              <select
                required
                value={form.userRole}
                onChange={(e) => update("userRole", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cannavec-500/30"
              >
                <option value="">Select role</option>
                {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cannavec-800 mb-1.5">Tier</label>
              <select
                value={form.tier}
                onChange={(e) => update("tier", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cannavec-500/30"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
                Organisation <span className="text-warm-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.org}
                onChange={(e) => update("org", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/admin" className="flex-1 cannavec-btn-secondary text-sm text-center !py-2.5">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 cannavec-btn-primary text-sm disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
