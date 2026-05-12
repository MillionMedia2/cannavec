"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plane,
  Car,
  Train,
  Loader2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  RotateCcw,
  FileText,
} from "lucide-react";
import {
  COUNTRIES_SORTED,
  ALL_HUB_OPTIONS,
  assessRouteRisk,
  assessTransitHub,
  type TravelMethod,
  type Duration,
  type RouteRisk,
} from "@/lib/travel-risk";
import type { TravelResponse, TravelSection } from "@/app/api/v1/travel/route";
import { TravelFollowUpChat } from "@/components/travel-followup-chat";

const TRAVEL_METHODS: { value: TravelMethod; label: string; icon: React.ElementType }[] = [
  { value: "flying", label: "Flying", icon: Plane },
  { value: "driving", label: "Driving", icon: Car },
  { value: "train_ferry", label: "Train or ferry", icon: Train },
];

const DURATIONS: { value: Duration; label: string }[] = [
  { value: "up_to_7", label: "Up to 7 days" },
  { value: "8_to_30", label: "8–30 days" },
  { value: "over_30", label: "Over 30 days" },
];

const RATE_LIMIT_KEY = "cannavec_travel_queries";
const RATE_LIMIT_DATE_KEY = "cannavec_travel_date";
const MAX_QUERIES_PER_DAY = 5;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getRemainingQueries(): number {
  try {
    const today = getTodayString();
    if (localStorage.getItem(RATE_LIMIT_DATE_KEY) !== today) {
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
    localStorage.setItem(RATE_LIMIT_DATE_KEY, getTodayString());
    const used = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || "0", 10);
    localStorage.setItem(RATE_LIMIT_KEY, String(used + 1));
  } catch {}
}

// ─── Staged thinking indicator ─────────────────────────────────────────────────

function StagedThinkingMain({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const label =
    elapsed > 20000 ? "Nearly there…" :
    elapsed > 10000 ? "Still thinking…" :
    "Thinking…";

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-sm text-warm-400 animate-pulse">{label}</span>
    </div>
  );
}

// ─── Assessment badge ──────────────────────────────────────────────────────────

function AssessmentBanner({ assessment, label }: { assessment: TravelResponse["assessment"]; label: string }) {
  const config = {
    green: {
      bg: "bg-emerald-50 border-emerald-200",
      icon: CheckCircle,
      iconClass: "text-emerald-500",
      textClass: "text-emerald-800",
      dot: "🟢",
    },
    amber: {
      bg: "bg-amber-50 border-amber-200",
      icon: AlertCircle,
      iconClass: "text-amber-500",
      textClass: "text-amber-800",
      dot: "🟠",
    },
    red: {
      bg: "bg-red-50 border-red-200",
      icon: XCircle,
      iconClass: "text-red-500",
      textClass: "text-red-800",
      dot: "🔴",
    },
  }[assessment];

  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-5 flex gap-4 ${config.bg}`}>
      <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${config.iconClass}`} />
      <p className={`font-medium leading-snug ${config.textClass}`}>{label}</p>
    </div>
  );
}

// ─── Transit warning banner ────────────────────────────────────────────────────

function TransitWarningBanner({ section }: { section: TravelSection }) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 flex gap-4">
      <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-amber-500" />
      <div>
        <p className="font-semibold text-amber-800 mb-1">{section.heading}</p>
        <p className="text-sm text-amber-700 leading-relaxed whitespace-pre-line">{section.body}</p>
      </div>
    </div>
  );
}

// ─── Content section card ──────────────────────────────────────────────────────

function SectionCard({ section }: { section: TravelSection }) {
  return (
    <div className="bg-white rounded-xl border border-warm-200 p-5">
      <h3 className="font-display text-lg text-cannavec-900 mb-3">{section.heading}</h3>
      <p className="text-sm text-warm-500 leading-relaxed whitespace-pre-line">{section.body}</p>
    </div>
  );
}

// ─── Select component ──────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; separatorAfter?: boolean }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-cannavec-800">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-warm-200 rounded-lg px-4 py-3 pr-10 text-sm text-cannavec-900 focus:outline-none focus:ring-2 focus:ring-cannavec-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <>
              <option key={o.value} value={o.value}>{o.label}</option>
              {o.separatorAfter && (
                <option key={`sep-${o.value}`} disabled className="text-warm-200">────────────────────────</option>
              )}
            </>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TravelPlannerSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelMethod, setTravelMethod] = useState<TravelMethod | "">("");
  const [duration, setDuration] = useState<Duration | "">("");
  const [transitHub, setTransitHub] = useState("");

  const [routeRisk, setRouteRisk] = useState<RouteRisk | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState(0);
  const [result, setResult] = useState<TravelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(MAX_QUERIES_PER_DAY);

  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRemaining(getRemainingQueries());
  }, []);

  // Recompute route risk whenever origin, destination, or travel method change.
  useEffect(() => {
    if (origin && destination && travelMethod === "flying") {
      const risk = assessRouteRisk(origin, destination, "flying");
      setRouteRisk(risk);
      // Reset transit hub if it's no longer needed.
      if (!risk.showHubSelector) setTransitHub("");
    } else {
      setRouteRisk(null);
      setTransitHub("");
    }
  }, [origin, destination, travelMethod]);

  const countryOptions = COUNTRIES_SORTED.map((c, i) => ({
    value: c.code,
    label: c.name,
    separatorAfter: i === 0, // UK is index 0 — separator after it
  }));
  const hubOptions = ALL_HUB_OPTIONS.map((h) => ({
    value: h.iata,
    label: h.iata === "DIRECT"
      ? h.city
      : `${h.city} (${h.iata}) — ${h.country}${h.risk === "high" ? " ⚠️" : ""}`,
  }));

  const showHubSelector = travelMethod === "flying" && routeRisk?.showHubSelector;

  const canSubmit =
    origin &&
    destination &&
    origin !== destination &&
    travelMethod &&
    duration &&
    remaining > 0 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setLoadingStart(Date.now());
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/v1/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, travelMethod, duration, transitHub: transitHub || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      const data: TravelResponse = await res.json();
      incrementQueryCount();
      setRemaining(getRemainingQueries());
      setResult(data);

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setOrigin("");
    setDestination("");
    setTravelMethod("");
    setDuration("");
    setTransitHub("");
    setRouteRisk(null);
    setResult(null);
    setError(null);
  }

  // Confirmed-hub transit warning (client-side, before submission).
  const confirmedHubWarning = transitHub ? assessTransitHub(transitHub) : null;

  return (
    <section className="py-16 bg-warm-50" id="try-it">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          {/* ── Form ── */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-cannavec-900">Plan your trip</h2>
              {result && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-warm-400 hover:text-cannavec-500 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Check another trip
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <SelectField
                label="I live in"
                value={origin}
                onChange={(v) => { setOrigin(v); setResult(null); }}
                options={countryOptions}
                placeholder="Select your country"
              />

              <SelectField
                label="I'm travelling to"
                value={destination}
                onChange={(v) => { setDestination(v); setResult(null); }}
                options={countryOptions}
                placeholder="Select destination"
              />

              {/* Travel method */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-cannavec-800">How am I getting there?</label>
                <div className="grid grid-cols-3 gap-2">
                  {TRAVEL_METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setTravelMethod(value); setResult(null); }}
                      className={`flex flex-col items-center gap-2 py-3 px-2 rounded-lg border text-xs font-medium transition-all ${
                        travelMethod === value
                          ? "border-cannavec-500 bg-cannavec-50 text-cannavec-700"
                          : "border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-cannavec-800">How long am I going for?</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setDuration(value); setResult(null); }}
                      className={`py-2.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                        duration === value
                          ? "border-cannavec-500 bg-cannavec-50 text-cannavec-700"
                          : "border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional transit hub selector */}
              {showHubSelector && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex flex-col gap-3">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {routeRisk?.message}
                    </p>
                  </div>
                  <SelectField
                    label="Your connecting airport"
                    value={transitHub}
                    onChange={setTransitHub}
                    options={hubOptions}
                    placeholder="Select your transit hub"
                  />
                  {/* Immediate warning if a high-risk hub is selected */}
                  {confirmedHubWarning && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex gap-2 items-start">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 leading-relaxed">
                        <strong>{confirmedHubWarning.city} ({confirmedHubWarning.countryCode})</strong> has zero tolerance for cannabis. Travelling via this hub with cannabis carries serious legal risk.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Destination-only warning (non-flying high-risk or known do-not-carry) */}
              {routeRisk?.warningType === "destination_only" && !showHubSelector && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex gap-2 items-start">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{routeRisk.message}</p>
                </div>
              )}

              {/* Rate limit */}
              {remaining === 0 ? (
                <div className="rounded-lg bg-warm-100 border border-warm-200 px-4 py-3 text-center text-xs text-warm-500">
                  You&apos;ve used your 5 free queries for today. Queries reset at midnight.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="cannavec-btn-primary w-full py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Planning your trip…
                    </span>
                  ) : (
                    "Plan My Trip"
                  )}
                </button>
              )}

              {loading && <StagedThinkingMain startTime={loadingStart} />}

              <p className="text-center text-xs text-warm-400">
                {remaining} free {remaining === 1 ? "query" : "queries"} remaining today
              </p>
            </form>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ── Results ── */}
          {result && (
            <div ref={outputRef} className="mt-8 flex flex-col gap-4">
              {/* Route assessment — always first */}
              <AssessmentBanner assessment={result.assessment} label={result.assessmentLabel} />

              {result.sections.map((section) =>
                section.id === "transit_warning" ? (
                  <TransitWarningBanner key={section.id} section={section} />
                ) : (
                  <SectionCard key={section.id} section={section} />
                )
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cannavec-50 text-cannavec-700 rounded-lg text-sm font-medium hover:bg-cannavec-100 transition-colors border border-cannavec-200"
                  onClick={() => window.print()}
                >
                  <FileText className="w-4 h-4" />
                  Download as PDF
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-warm-500 rounded-lg text-sm font-medium hover:text-warm-600 transition-colors border border-warm-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Check another trip
                </button>
              </div>

              {/* Follow-up chat */}
              <TravelFollowUpChat
                travelContext={`Trip: ${COUNTRIES_SORTED.find(c => c.code === origin)?.name ?? origin} to ${COUNTRIES_SORTED.find(c => c.code === destination)?.name ?? destination}. Assessment: ${result.assessment}. ${result.assessmentLabel}. Sections: ${result.sections.map(s => `${s.heading}: ${s.body.slice(0, 200)}`).join(' | ')}`}
              />

              {/* Disclaimer */}
              <p className="text-xs text-warm-400 leading-relaxed pt-2 border-t border-warm-200">
                Verified as of {result.verifiedAsOf}. This guidance is derived from the Cannabis Knowledge Base. Laws change — verify all requirements with the relevant embassy. This is not legal advice and you must still check with your doctor or clinic before travel.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
