"use client";

import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import type { Verdict } from "@/lib/triage/types";
import { verdictHeadline } from "@/lib/triage/eligibility";

interface VerdictCardProps {
  verdict: Verdict;
}

const STYLES = {
  green: {
    icon: CheckCircle,
    iconClass: "text-[#8a9a5a]",
    border: "border-[#8a9a5a]",
    bg: "bg-[#f5f7f0]",
    chip: "bg-[#8a9a5a] text-white",
    chipLabel: "Likely eligible",
  },
  amber: {
    icon: AlertCircle,
    iconClass: "text-[#f59e0b]",
    border: "border-[#f59e0b]",
    bg: "bg-[#fffbeb]",
    chip: "bg-[#f59e0b] text-white",
    chipLabel: "Assessment needed",
  },
  red: {
    icon: XCircle,
    iconClass: "text-[#dc2626]",
    border: "border-[#dc2626]",
    bg: "bg-[#fef2f2]",
    chip: "bg-[#dc2626] text-white",
    chipLabel: "Not currently suitable",
  },
} as const;

export function VerdictCard({ verdict }: VerdictCardProps) {
  const s = STYLES[verdict.status];
  const Icon = s.icon;

  return (
    <div className={`border-2 ${s.border} ${s.bg} rounded-xl overflow-hidden`}>
      <div className="px-5 py-4 flex items-start gap-3">
        <Icon className={`${s.iconClass} w-6 h-6 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`${s.chip} text-xs font-medium px-2 py-0.5 rounded`}
            >
              {s.chipLabel}
            </span>
          </div>
          <h3 className="font-display text-lg text-cannavec-900 leading-tight">
            {verdictHeadline(verdict.status)}
          </h3>
        </div>
      </div>

      {verdict.reasons.length > 0 && (
        <div className="px-5 pb-4 space-y-2">
          {verdict.reasons.map((r, i) => (
            <p key={i} className="text-sm text-warm-700 leading-relaxed">
              {r}
            </p>
          ))}
        </div>
      )}

      {verdict.signpost && (
        <div className="mx-5 mb-4 px-4 py-3 bg-white border border-warm-200 rounded-lg flex items-start gap-2.5">
          <Info className="w-4 h-4 text-warm-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warm-700 leading-relaxed">
            {verdict.signpost.message}
          </p>
        </div>
      )}
    </div>
  );
}
