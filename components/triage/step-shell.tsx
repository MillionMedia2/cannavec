"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface StepShellProps {
  /** Step number (1-based) for the progress indicator. */
  stepNumber: number;
  /** Total number of visible steps. */
  totalSteps: number;
  /** Step heading (the question). */
  heading: string;
  /** Optional supporting text shown below the heading. */
  subheading?: React.ReactNode;
  /** The step's input controls. */
  children: React.ReactNode;
  /** Called when Next is pressed. */
  onNext: () => void;
  /** Called when Back is pressed. If undefined, the Back button is hidden. */
  onBack?: () => void;
  /** Disable Next when the step's input is incomplete or invalid. */
  nextDisabled?: boolean;
  /** Override the Next button label (default: "Next"). */
  nextLabel?: string;
  /** Show a loading state on Next (used when calling /api/v1/triage/*). */
  loading?: boolean;
}

/**
 * Triage wizard step shell — heading, slot for content, Back/Next bar, progress bar.
 * All steps render inside this. Stepped-form pattern (not chat).
 */
export function StepShell({
  stepNumber,
  totalSteps,
  heading,
  subheading,
  children,
  onNext,
  onBack,
  nextDisabled = false,
  nextLabel = "Next",
  loading = false,
}: StepShellProps) {
  const pct = Math.round((stepNumber / totalSteps) * 100);

  return (
    <div className="bg-white border border-warm-200 rounded-xl shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between text-xs text-warm-500 mb-2">
          <span>Step {stepNumber} of {totalSteps}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8a9a5a] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Heading + content */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="font-display text-xl text-cannavec-900 leading-tight">{heading}</h2>
        {subheading && (
          <div className="mt-2 text-sm text-warm-500 leading-relaxed">{subheading}</div>
        )}
      </div>

      <div className="px-6 py-5">{children}</div>

      {/* Nav bar */}
      <div className="px-6 py-4 bg-warm-50 border-t border-warm-200 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center gap-1 text-sm text-warm-600 hover:text-warm-900 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#8a9a5a] text-white text-sm font-medium hover:bg-[#7a8a4a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Working…</span>
            </>
          ) : (
            <>
              <span>{nextLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Inline "Help — what counts?" expander for places where patients
 * commonly ask "like what?" or "why do you need to know?".
 */
export function HelpExpander({
  label,
  children,
  open,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-3 border border-warm-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
      >
        <span>{label}</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 py-3 bg-warm-50 text-sm text-warm-700 leading-relaxed border-t border-warm-200">
          {children}
        </div>
      )}
    </div>
  );
}

/** A standard yes/no radio pair used in many steps. */
export function YesNoRadios({
  value,
  onChange,
  name,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  name: string;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 px-5 py-3 rounded-lg border-2 text-left transition-colors ${
          value === true
            ? "border-[#8a9a5a] bg-[#f5f7f0] text-cannavec-900"
            : "border-warm-200 hover:border-warm-300 text-warm-700"
        }`}
        aria-pressed={value === true}
        aria-label={`${name}: ${yesLabel}`}
      >
        <span className="font-medium">{yesLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 px-5 py-3 rounded-lg border-2 text-left transition-colors ${
          value === false
            ? "border-[#8a9a5a] bg-[#f5f7f0] text-cannavec-900"
            : "border-warm-200 hover:border-warm-300 text-warm-700"
        }`}
        aria-pressed={value === false}
        aria-label={`${name}: ${noLabel}`}
      >
        <span className="font-medium">{noLabel}</span>
      </button>
    </div>
  );
}
