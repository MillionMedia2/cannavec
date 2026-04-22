"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
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
          {sent ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-accent" />
              </div>
              <h1 className="font-display text-2xl text-cannavec-900 mb-2">
                Check your email
              </h1>
              <p className="text-warm-500 text-sm mb-6">
                We sent a login link to{" "}
                <span className="font-medium text-cannavec-700">{email}</span>.
                Click the link to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-accent hover:text-accent-dark transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-cannavec-900 mb-1">
                Sign in
              </h1>
              <p className="text-warm-500 text-sm mb-6">
                Enter your email and we'll send you a login link.
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-cannavec-800 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                  disabled={loading || !email}
                  className="w-full cannavec-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send login link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-warm-400 mt-6">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-cannavec-600 hover:text-cannavec-700 font-medium transition-colors"
                >
                  Request access
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
