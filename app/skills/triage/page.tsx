import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Globe,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Eligibility Check — Cannavec Skills",
  description:
    "A patient-facing triage workflow for UK medical cannabis. Answers a few questions, produces an evidence-grounded verdict, and books a clinic call. Embeddable on clinic and patient sites.",
};

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Evidence-grounded triage",
    description:
      "Verdicts ground in the Cannabis Knowledge Base: real condition-treatability data, real contraindication logic, no hardcoded gates.",
  },
  {
    icon: ShieldCheck,
    title: "Clinical nuance, not yes/no",
    description:
      "Three-state verdict (likely eligible, assessment needed, not suitable). Family psychosis or one prior treatment doesn't disqualify — it flags for the clinician.",
  },
  {
    icon: Sparkles,
    title: "Patient-friendly UI",
    description:
      "Stepped form with typeahead conditions and inline help. Average completion under 3 minutes.",
  },
  {
    icon: Globe,
    title: "Three deployment surfaces",
    description:
      "Run inside the Cannavec dashboard, embed on your patient-facing site via iframe, or white-label per clinic.",
  },
];

export default function TriageSkillPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 px-3 py-1 bg-cannavec-50 rounded-full hover:bg-cannavec-100 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-cannavec-500" />
                <span className="text-xs font-medium text-cannavec-600 tracking-wide">
                  CANNAVEC SKILLS
                </span>
              </Link>
              <span className="text-xs text-warm-300">/</span>
              <span className="text-xs font-medium text-cannavec-500">
                Free Eligibility Check
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-cannavec-900 mb-4">
              Am I eligible for medical cannabis?
            </h1>
            <p className="text-lg text-warm-500 mb-4 max-w-2xl">
              The Free Eligibility Check is a patient-facing triage workflow for
              UK medical cannabis. A few questions in, the patient gets a clear
              verdict — and the clinic gets a structured intake with every flag
              already raised.
            </p>
            <p className="text-sm text-warm-400 mb-8">
              Built on the Cannabis Knowledge Foundation database. Embeddable on
              any clinic site via iframe, or available as a Skill inside Cannavec.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="cannavec-btn-primary inline-flex items-center gap-2"
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="cannavec-btn-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sign-up gate */}
      <section className="py-16 bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 bg-[#f5f7f0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[#8a9a5a]" />
            </div>
            <h2 className="font-display text-2xl text-cannavec-900 mb-3">
              Free to try — sign in to access
            </h2>
            <p className="text-warm-500 text-sm mb-6 leading-relaxed">
              The Free Eligibility Check is available to all registered Cannavec
              users at no charge. Create a free account to use it now, or contact
              us about embedding it on your clinic or patient site.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="cannavec-btn-primary inline-flex items-center justify-center gap-2"
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="cannavec-btn-secondary inline-flex items-center justify-center gap-2"
              >
                Embed it on my site
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-cannavec-900 mb-10">
            What it does
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-warm-200 p-5"
              >
                <div className="w-9 h-9 bg-cannavec-50 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-cannavec-500" />
                </div>
                <h3 className="font-medium text-cannavec-900 text-sm mb-1">
                  {title}
                </h3>
                <p className="text-xs text-warm-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the verdict works */}
      <section className="py-16 bg-white border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl text-cannavec-900 mb-3">
              The verdict is calibrated, not binary
            </h2>
            <p className="text-sm text-warm-500 mb-8 leading-relaxed">
              UK eligibility for private medical cannabis isn&apos;t a simple
              yes/no. Real clinical judgement matters. The verdict surfaces three
              states.
            </p>
            <div className="space-y-3">
              <VerdictRow
                colour="#8a9a5a"
                label="Likely eligible"
                description="Treatable condition, two prior treatments tried, no contraindications. Patient proceeds to booking with no flags."
              />
              <VerdictRow
                colour="#f59e0b"
                label="Assessment needed"
                description="Booking proceeds but the clinic sees flags — family psychosis history, sparse medical records, one prior treatment, current medications, under-18 with qualifying condition."
              />
              <VerdictRow
                colour="#dc2626"
                label="Not currently suitable"
                description="Contraindicated condition, active personal psychosis, pregnancy, or no qualifying clinical indication. Booking blocked; patient gets a relevant signpost."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Back to all Skills */}
      <section className="py-8 bg-warm-50 border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/skills"
            className="text-sm text-cannavec-500 hover:underline inline-flex items-center gap-1"
          >
            ← All Skills
          </Link>
        </div>
      </section>
    </>
  );
}

function VerdictRow({
  colour,
  label,
  description,
}: {
  colour: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-warm-50 rounded-lg border border-warm-200">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
        style={{ backgroundColor: colour }}
      />
      <div>
        <div className="font-medium text-cannavec-900 text-sm">{label}</div>
        <p className="text-xs text-warm-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
