"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Sparkles,
  FlaskConical,
  Leaf,
  Droplets,
  Pill,
  ChevronRight,
  AlertCircle,
  Beaker,
} from "lucide-react";

const PRODUCT_FORMS = [
  { value: "all", label: "All Forms", icon: Sparkles },
  { value: "Cannabis Flower", label: "Flower", icon: Leaf },
  { value: "Cannabis Oil", label: "Oil", icon: Droplets },
  { value: "Cannabis Capsules", label: "Capsules", icon: Pill },
  { value: "Cannabis Cartridge", label: "Cartridge", icon: FlaskConical },
];

const EXAMPLE_CONDITIONS = [
  "Chronic pain",
  "Insomnia",
  "Anxiety",
  "Muscle spasms",
];

const RATE_LIMIT_KEY = "cannavec_demo_queries";
const RATE_LIMIT_DATE_KEY = "cannavec_demo_date";
const MAX_QUERIES_PER_DAY = 5;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
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

interface Product {
  product_name: string;
  brand: string;
  sku: string;
  score: number;
  thc: string;
  cbd: string;
  product_form: string;
  strain_name: string | null;
  strain_type: string | null;
  terpenes: string[];
  conditions: string[];
  effects: string[];
  price: string | null;
  quantity: string | null;
  flavour: string | null;
  medical_notes: string | null;
  potency: string | null;
  product_type: string | null;
  jurisdiction: string | null;
}

interface LookupResponse {
  step: string;
  supported: boolean;
  condition: string;
  product_form_filter?: string;
  message?: string;
  suggestion?: string;
  evidence_summary?: {
    relevant_terpenes: string[];
    evidence_grades: string[];
    knowledge_base_reasoning: string[];
  };
  products?: Product[];
  meta?: Record<string, any>;
  error?: string;
}

export function ProductLookupSection({ authenticated = false }: { authenticated?: boolean }) {
  const [condition, setCondition] = useState("");
  const [productForm, setProductForm] = useState("all");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<LookupResponse | null>(null);
  const [remaining, setRemaining] = useState<number>(MAX_QUERIES_PER_DAY);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) setRemaining(getRemainingQueries());
  }, [authenticated]);

  const handleLookup = async (presetCondition?: string) => {
    const searchCondition = presetCondition || condition;
    if (!searchCondition.trim()) return;

    if (!authenticated) {
      const currentRemaining = getRemainingQueries();
      if (currentRemaining <= 0) {
        setResponse({
          step: "rate_limited",
          supported: false,
          condition: searchCondition,
          message:
            "You've used all 5 free queries for today. Come back tomorrow, or sign up for full access.",
        });
        return;
      }
    }

    setCondition(searchCondition);
    setLoading(true);
    setResponse(null);
    setError(null);

    // Animate the steps
    setActiveStep("Checking condition against cannabis evidence base...");
    await new Promise((r) => setTimeout(r, 600));
    setActiveStep("Identifying relevant terpenes and cannabinoids...");

    try {
      const res = await fetch("/api/v1/product-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition: searchCondition,
          product_form: productForm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Lookup failed");
      }

      if (data.products?.length) {
        setActiveStep("Matching products from cannabis_products database...");
        await new Promise((r) => setTimeout(r, 400));
      }

      if (!authenticated) {
        incrementQueryCount();
        setRemaining(getRemainingQueries());
      }
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cannavec-50 rounded-full mb-4">
            <FlaskConical size={14} className="text-cannavec-500" />
            <span className="text-xs font-medium text-cannavec-600 tracking-wide">
              SKILL · PRODUCT LOOKUP
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
            Find the right product for your condition.
          </h2>
          <p className="text-lg text-warm-500">
            Tell us your condition and we&apos;ll search the evidence base, identify the
            right terpene profiles, and recommend matching products from the UK
            cannabis products database.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Panel */}
          <div>
            {/* Quick Select */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
                Quick Select
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleLookup(c)}
                    disabled={loading || remaining <= 0}
                    className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-warm-200 hover:border-cannavec-300 hover:bg-cannavec-50 transition-all text-sm text-warm-500 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight
                      size={14}
                      className="text-warm-300 group-hover:text-cannavec-500 transition-colors shrink-0"
                    />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">
                Condition
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="e.g. chronic pain, insomnia, anxiety..."
                  className="w-full px-5 py-4 pr-14 bg-white rounded-lg border-2 border-warm-200 focus:border-cannavec-500 focus:ring-0 outline-none text-base font-body transition-colors"
                />
                <button
                  onClick={() => handleLookup()}
                  disabled={loading || remaining <= 0 || !condition.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cannavec-500 text-white rounded-md hover:bg-cannavec-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Product Form Dropdown */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">
                Product Form
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCT_FORMS.map((pf) => {
                  const Icon = pf.icon;
                  const isActive = productForm === pf.value;
                  return (
                    <button
                      key={pf.value}
                      onClick={() => setProductForm(pf.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        isActive
                          ? "bg-cannavec-500 text-white border-cannavec-500"
                          : "bg-white text-warm-500 border-warm-200 hover:border-cannavec-300"
                      }`}
                    >
                      <Icon size={14} />
                      {pf.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rate limit info */}
            {!authenticated && (
              <p className="text-xs text-warm-400">
                {remaining > 0 ? (
                  <>
                    Public demo: {MAX_QUERIES_PER_DAY} queries/day.{" "}
                    <span className="font-medium text-cannavec-500">
                      {remaining} remaining today.
                    </span>{" "}
                    <a href="/pricing" className="text-cannavec-500 hover:underline">
                      Get full access →
                    </a>
                  </>
                ) : (
                  <>
                    Daily limit reached.{" "}
                    <a href="/pricing" className="text-cannavec-500 hover:underline font-medium">
                      Get full access →
                    </a>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Right: Results Terminal */}
          <div className="demo-terminal min-h-[560px] relative flex flex-col">
            <div className="demo-terminal-header">
              <div className="demo-terminal-dot bg-red-500/80" />
              <div className="demo-terminal-dot bg-yellow-500/80" />
              <div className="demo-terminal-dot bg-green-500/80" />
              <span className="ml-3 text-xs text-white/30 font-mono">
                product-lookup-results
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Empty state */}
              {!response && !loading && !error && (
                <div className="flex items-center justify-center h-[480px]">
                  <div className="text-center">
                    <FlaskConical
                      size={32}
                      className="text-white/10 mx-auto mb-4"
                    />
                    <p className="text-white/30 text-sm">
                      Enter a condition to find matching products
                    </p>
                  </div>
                </div>
              )}

              {/* Loading with step indicators */}
              {loading && (
                <div className="flex items-center justify-center h-[480px]">
                  <div className="text-center px-6">
                    <Loader2
                      size={24}
                      className="text-accent animate-spin mx-auto mb-4"
                    />
                    <p className="text-white/60 text-sm mb-2">
                      {activeStep || "Searching..."}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-pulse" />
                      <div
                        className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="flex items-center justify-center h-[480px]">
                  <div className="text-center px-6">
                    <AlertCircle
                      size={24}
                      className="text-red-400/60 mx-auto mb-3"
                    />
                    <p className="text-red-400/80 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Results — rich formatted view */}
              {response && !loading && (
                <div className="space-y-4 text-sm">
                  {/* Not supported */}
                  {!response.supported && (
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-amber-300 text-sm mb-2">
                        {response.message}
                      </p>
                      {response.suggestion && (
                        <p className="text-amber-300/60 text-xs">
                          {response.suggestion}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Evidence reasoning */}
                  {response.supported && response.evidence_summary && (
                    <>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-accent text-xs font-medium uppercase tracking-wider mb-2">
                          Evidence Summary · {response.condition}
                        </p>
                        {response.evidence_summary.relevant_terpenes.length >
                          0 && (
                          <div className="mb-3">
                            <p className="text-white/40 text-xs mb-1.5">
                              Relevant terpenes identified:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {response.evidence_summary.relevant_terpenes.map(
                                (t) => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 bg-accent/15 text-accent text-xs rounded-full capitalize"
                                  >
                                    {t}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {response.evidence_summary.knowledge_base_reasoning
                          .length > 0 && (
                          <div>
                            <p className="text-white/40 text-xs mb-1.5">
                              From the cannabis knowledge base:
                            </p>
                            {response.evidence_summary.knowledge_base_reasoning.map(
                              (r, i) => (
                                <p
                                  key={i}
                                  className="text-white/60 text-xs leading-relaxed mb-1.5 pl-3 border-l border-white/10"
                                >
                                  {r.length > 200 ? r.slice(0, 200) + "..." : r}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Products */}
                      {response.products && response.products.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-accent text-xs font-medium uppercase tracking-wider">
                            Recommended Products (
                            {response.product_form_filter !== "all"
                              ? response.product_form_filter
                              : "All Forms"}
                            )
                          </p>
                          {response.products.map((p, i) => (
                            <div
                              key={i}
                              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                  <h4 className="text-white font-medium text-sm">
                                    {p.product_name}
                                  </h4>
                                  <p className="text-white/40 text-xs">
                                    {p.brand}
                                    {p.strain_name
                                      ? ` · ${p.strain_name}`
                                      : ""}
                                    {p.strain_type
                                      ? ` (${p.strain_type})`
                                      : ""}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  {p.price && (
                                    <p className="text-accent font-medium text-sm">
                                      {p.price}
                                    </p>
                                  )}
                                  {p.quantity && (
                                    <p className="text-white/30 text-xs">
                                      {p.quantity}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
                                <div>
                                  <span className="text-white/40">THC: </span>
                                  <span className="text-white/70">{p.thc}</span>
                                </div>
                                <div>
                                  <span className="text-white/40">CBD: </span>
                                  <span className="text-white/70">{p.cbd}</span>
                                </div>
                                <div>
                                  <span className="text-white/40">Form: </span>
                                  <span className="text-white/70">
                                    {p.product_form}
                                  </span>
                                </div>
                                {p.potency && (
                                  <div>
                                    <span className="text-white/40">
                                      Potency:{" "}
                                    </span>
                                    <span className="text-white/70">
                                      {p.potency}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {p.terpenes.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-white/40 text-xs">
                                    Terpenes:{" "}
                                  </span>
                                  <span className="text-white/60 text-xs">
                                    {p.terpenes.join(", ")}
                                  </span>
                                </div>
                              )}

                              {p.conditions.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-white/40 text-xs">
                                    Conditions:{" "}
                                  </span>
                                  <span className="text-white/60 text-xs">
                                    {p.conditions.join(", ")}
                                  </span>
                                </div>
                              )}

                              {p.effects.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-white/40 text-xs">
                                    Effects:{" "}
                                  </span>
                                  <span className="text-white/60 text-xs">
                                    {p.effects.join(", ")}
                                  </span>
                                </div>
                              )}

                              {p.medical_notes && (
                                <p className="text-white/50 text-xs mt-2 pt-2 border-t border-white/5 italic">
                                  {p.medical_notes}
                                </p>
                              )}

                              {p.jurisdiction && (
                                <div className="mt-2">
                                  <span className="px-1.5 py-0.5 bg-white/5 text-white/30 text-[10px] rounded">
                                    {p.jurisdiction}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        response.supported && (
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white/50 text-sm">
                              No products found matching your criteria. Try
                              selecting a different product form or broadening
                              your condition.
                            </p>
                          </div>
                        )
                      )}

                      {/* Meta */}
                      {response.meta && (
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-white/20 text-[10px] font-mono">
                            {response.meta.response_time_ms}ms ·{" "}
                            {response.meta.cannabis_results_checked} evidence
                            records checked ·{" "}
                            {response.meta.products_returned} products returned
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
