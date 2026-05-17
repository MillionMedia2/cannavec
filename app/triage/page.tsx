import type { Metadata } from "next";
import { TriageSection } from "@/components/triage-section";

export const metadata: Metadata = {
  title: "Free Medical Cannabis Eligibility Check",
  description:
    "Find out in three minutes whether you're likely eligible for a UK medical cannabis prescription. No commitment, no charge.",
  robots: { index: true, follow: true },
};

/**
 * Standalone iframe-embeddable triage page.
 *
 * Used by plantz.io and (in future) by white-label clinic sites via iframe.
 * - No global nav (Navigation hides itself on /triage routes)
 * - No global footer (FooterWrapper hides itself on /triage routes)
 * - Transparent background so the host page's styling shows through
 * - Same TriageSection component as the dashboard version — single source of truth
 */
export default function StandaloneTriagePage() {
  return (
    <div className="min-h-screen bg-transparent py-6">
      <TriageSection />
    </div>
  );
}
