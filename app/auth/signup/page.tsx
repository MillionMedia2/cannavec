"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Building2, ArrowRight, CheckCircle } from "lucide-react";

const ROLES = ["Patient", "Doctor", "Researcher", "Developer", "Other"];

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
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

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: form.fullName,
          role: form.role.toLowerCase(),
          org_name: form.org || null,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 cannavec-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-mono text-sm font-bold">cv</span>
          </div>
          <span className="font-display text-2xl text-cannavec-900 tracking-tight">
            cannavec
          </span>
          <span className="text-accent text-sm font-mono font-medium mt-1">.ai</span>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-8">
          {done ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-accent" />
              </div>
              <h1 className="font-display text-2xl text-cannavec-900 mb-2">
                Check your email
              </h1>
              <p className="text-warm-500 text-sm">
                We sent a login link to{" "}
                <span className="font-medium text-cannavec-700">{form.email}</span>.
                Click the link to activate your account.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-cannavec-900 mb-1">
                Request access
              </h1>
              <p className="text-warm-500 text-sm mb-6">
                Create a free account to access the Cannabis Knowledge Base.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      placeholder="Dr. Jane Smith"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
                    I am a...
                  </label>
                  <select
                    required
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500 transition bg-white"
                  >
                    <option value="">Select your role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
                    Organisation{" "}
                    <span className="text-warm-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                    <input
                      type="text"
                      value={form.org}
                      onChange={(e) => update("org", e.target.value)}
                      placeholder="Clinic or company name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500 transition"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !form.fullName || !form.email || !form.role}
                  className="w-full cannavec-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-warm-400 mt-6">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-cannavec-600 hover:text-cannavec-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
