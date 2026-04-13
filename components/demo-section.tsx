"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, ChevronRight, Sparkles } from "lucide-react";

const EXAMPLE_QUERIES = [
  "What does the evidence say about CBD for anxiety?",
  "THC:CBD ratios for chronic pain management",
  "Terpene profiles associated with anti-inflammatory effects",
  "Drug interactions between cannabis and SSRIs",
];

const RATE_LIMIT_KEY = "cannavec_demo_queries";
const RATE_LIMIT_DATE_KEY = "cannavec_demo_date";
const MAX_QUERIES_PER_DAY = 5;

function getTodayString() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function getRemainingQueries(): number {
  try {
    const today = getTodayString();
    const savedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY);
    if (savedDate !== today) {
      localStorage.setItem(RATE_LIMIT_DATE_KEY, today);
      localStorage.setItem(RATE_LIMIT_KEY, "0");
      return MAX_QUERIES_PER_DAY;
    }
    const used = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || "0", 10);
    return Math.max(0, MAX_QUERIES_PER_DAY - used);
  } catch {
    return MAX_QUERIES_PER_DAY;
  }
}

function incrementQueryCount() {
  try {
    const today = getTodayString();
    localStorage.setItem(RATE_LIMIT_DATE_KEY, today);
    const used = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || "0", 10);
    localStorage.setItem(RATE_LIMIT_KEY, String(used + 1));
  } catch {
    // ignore
  }
}

export function DemoSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<object | null>(null);
  const [remaining, setRemaining] = useState<number>(MAX_QUERIES_PER_DAY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRemaining(getRemainingQueries());
  }, []);

  const handleDemo = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    const currentRemaining = getRemainingQueries();
    if (currentRemaining <= 0) {
      setResponse({
        error: "Daily limit reached",
        message: "You've used all 5 free demo queries for today. Come back tomorrow, or sign up for full API access.",
        cta: { label: "Get API Access", href: "/pricing" },
      });
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // Call the real API with a demo key — no auth required for demo endpoint
      const res = await fetch("/api/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Demo mode: pass a sentinel key that bypasses Stripe validation
          Authorization: "Bearer demo_public_key",
        },
        body: JSON.stringify({
          query: searchQuery,
          namespace: "cannabis",
          top_k: 3,
          include_metadata: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Query failed");
      }

      // Increment counter after a successful call
      incrementQueryCount();
      const newRemaining = getRemainingQueries();
      setRemaining(newRemaining);

      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="py-20 sm:py-28 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cannavec-50 rounded-full mb-4">
            <Sparkles size={14} className="text-cannavec-500" />
            <span className="text-xs font-medium text-cannavec-600 tracking-wide">LIVE DEMO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
            Ask any cannabis question.
          </h2>
          <p className="text-lg text-warm-500">
            See what your platform could return. Evidence-graded, cited, and ready for production.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="relative mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemo()}
                placeholder="Ask a cannabis science question..."
                className="w-full px-5 py-4 pr-14 bg-white rounded-lg border-2 border-warm-200 focus:border-cannavec-500 focus:ring-0 outline-none text-base font-body transition-colors"
              />
              <button
                onClick={() => handleDemo()}
                disabled={loading || remaining <= 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cannavec-500 text-white rounded-md hover:bg-cannavec-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">Try these examples</p>
              {EXAMPLE_QUERIES.map((eq, i) => (
                <button
                  key={i}
                  onClick={() => handleDemo(eq)}
                  disabled={loading || remaining <= 0}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 bg-white rounded-lg border border-warm-200 hover:border-cannavec-300 hover:bg-cannavec-50 transition-all text-sm text-warm-500 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} className="text-warm-300 group-hover:text-cannavec-500 transition-colors shrink-0" />
                  {eq}
                </button>
              ))}
            </div>

            <p className="text-xs text-warm-400 mt-6">
              {remaining > 0 ? (
                <>
                  Public demo is limited to {MAX_QUERIES_PER_DAY} queries/day.{" "}
                  <span className="font-medium text-cannavec-500">{remaining} remaining today.</span>{" "}
                  <a href="/pricing" className="text-cannavec-500 hover:underline">Get full access →</a>
                </>
              ) : (
                <>
                  Daily limit reached.{" "}
                  <a href="/pricing" className="text-cannavec-500 hover:underline font-medium">Get full access →</a>
                </>
              )}
            </p>
          </div>

          <div className="demo-terminal min-h-[500px] relative">
            <div className="demo-terminal-header">
              <div className="demo-terminal-dot bg-red-500/80" />
              <div className="demo-terminal-dot bg-yellow-500/80" />
              <div className="demo-terminal-dot bg-green-500/80" />
              <span className="ml-3 text-xs text-white/30 font-mono">cannavec-api-response</span>
            </div>

            {!response && !loading && !error && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="text-warm-400/30 text-4xl mb-4">{"{ }"}</div>
                  <p className="text-white/30 text-sm">Query the knowledge base to see results</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <Loader2 size={24} className="text-accent animate-spin mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Searching cannabis knowledge base...</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center px-6">
                  <div className="text-red-400/60 text-2xl mb-3">⚠</div>
                  <p className="text-red-400/80 text-sm">{error}</p>
                </div>
              </div>
            )}

            {response && !loading && (
              <pre className="text-xs text-white/80 overflow-auto max-h-[440px] leading-relaxed whitespace-pre-wrap">
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
