"use client";

import { useState } from "react";
import { Search, Loader2, ChevronRight, Sparkles } from "lucide-react";

const EXAMPLE_QUERIES = [
  "What does the evidence say about CBD for anxiety?",
  "THC:CBD ratios for chronic pain management",
  "Terpene profiles associated with anti-inflammatory effects",
  "Drug interactions between cannabis and SSRIs",
];

// Simulated response for the public demo
const DEMO_RESPONSES: Record<string, object> = {
  default: {
    query: "What does the evidence say about CBD for anxiety?",
    namespace: "cannabis",
    results: [
      {
        score: 0.94,
        id: "cbd_anxiety_clinical_001",
        metadata: {
          topic: "CBD Anxiolytic Mechanisms",
          finding:
            "CBD demonstrates anxiolytic effects through 5-HT1A receptor agonism and modulation of endocannabinoid signalling",
          evidence_grade: "Level A",
          authority_score: 9,
          clinical_relevance:
            "Multiple RCTs support doses of 300-600mg for acute situational anxiety. Lower chronic doses (25-75mg/day) show promise in generalised anxiety disorder.",
          sources: "Zuardi et al. 2017; Blessing et al. 2015; Masataka 2019",
        },
      },
      {
        score: 0.89,
        id: "cbd_anxiety_dosing_002",
        metadata: {
          topic: "CBD Dosing Protocols for Anxiety",
          finding:
            "Bell-shaped dose-response curve observed — 300mg optimal for public speaking anxiety in clinical trials",
          evidence_grade: "Level A",
          authority_score: 8,
          clinical_relevance:
            "Higher doses (>600mg) may not improve efficacy and increase cost. Titration from low doses recommended.",
          sources: "Linares et al. 2019; Zuardi et al. 2017",
        },
      },
      {
        score: 0.82,
        id: "cbd_anxiety_safety_003",
        metadata: {
          topic: "CBD Safety Profile in Anxiety Treatment",
          finding:
            "CBD shows favourable safety profile with minimal adverse effects at therapeutic doses for anxiety",
          evidence_grade: "Level B",
          authority_score: 8,
          clinical_relevance:
            "Common side effects: drowsiness, dry mouth, reduced appetite. No evidence of dependence or withdrawal at therapeutic doses.",
          sources: "Larsen & Shahinas 2020; WHO Expert Committee 2018",
        },
      },
    ],
    meta: {
      response_time_ms: 142,
      records_searched: 792,
      namespace: "cannabis",
      evidence_grades: { A: 2, B: 1 },
    },
  },
};

export function DemoSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<object | null>(null);

  const handleDemo = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setResponse(null);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    setResponse(DEMO_RESPONSES.default);
    setLoading(false);
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
                disabled={loading}
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
                  className="flex items-center gap-2 w-full text-left px-4 py-3 bg-white rounded-lg border border-warm-200 hover:border-cannavec-300 hover:bg-cannavec-50 transition-all text-sm text-warm-500 group"
                >
                  <ChevronRight size={14} className="text-warm-300 group-hover:text-cannavec-500 transition-colors shrink-0" />
                  {eq}
                </button>
              ))}
            </div>

            <p className="text-xs text-warm-400 mt-6">
              Public demo is limited to 5 queries/day.{" "}
              <a href="/pricing" className="text-cannavec-500 hover:underline">Get full access →</a>
            </p>
          </div>

          <div className="demo-terminal min-h-[500px] relative">
            <div className="demo-terminal-header">
              <div className="demo-terminal-dot bg-red-500/80" />
              <div className="demo-terminal-dot bg-yellow-500/80" />
              <div className="demo-terminal-dot bg-green-500/80" />
              <span className="ml-3 text-xs text-white/30 font-mono">cannavec-api-response</span>
            </div>

            {!response && !loading && (
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
                  <p className="text-white/40 text-sm">Searching 792 cannabis records...</p>
                </div>
              </div>
            )}

            {response && (
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
