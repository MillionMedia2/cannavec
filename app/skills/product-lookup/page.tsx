import { ProductLookupSection } from "@/components/product-lookup-section";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Leaf,
  Droplets,
  Pill,
  ArrowRight,
  Zap,
  Code2,
  MonitorSmartphone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Product Lookup — Cannavec Skills",
  description:
    "Search the UK/EU cannabis products database by condition. Evidence-based product recommendations with terpene matching and clinical reasoning.",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Enter a condition",
    body: "Type any condition — chronic pain, insomnia, anxiety, spasticity — and optionally filter by product form (flower, oil, capsules, cartridge).",
  },
  {
    step: "02",
    title: "Evidence base consulted",
    body: "The CKF knowledge base is searched to identify which terpenes and cannabinoid ratios are backed by clinical evidence for your condition.",
  },
  {
    step: "03",
    title: "Matching products returned",
    body: "Products from the UK/EU database are ranked by relevance. You get full cannabinoid data, terpene profiles, pricing, and the reasoning behind each recommendation.",
  },
];

const FEATURES = [
  {
    icon: Package,
    title: "800+ UK/EU products",
    description:
      "The full regulated medical cannabis product database — flower, oil, capsules, and cartridges. Updated regularly.",
  },
  {
    icon: Leaf,
    title: "Evidence-matched terpenes",
    description:
      "Cross-references the cannabis knowledge base to identify terpene profiles clinically relevant to your condition.",
  },
  {
    icon: Droplets,
    title: "Full cannabinoid profiles",
    description:
      "THC/CBD content, potency ratings, strain names, form-factor details, and pricing for every product returned.",
  },
  {
    icon: Pill,
    title: "Clinical reasoning",
    description:
      "Evidence summaries explain why products are recommended — grounded in the CKF knowledge base, not guesswork.",
  },
];

export default function ProductLookupPage() {
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
                Product Lookup
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-cannavec-900 mb-4">
              Find the right product for any condition.
            </h1>
            <p className="text-lg text-warm-500 mb-6 max-w-2xl">
              Product Lookup cross-references the clinical evidence base with
              the UK/EU cannabis products database. Enter a condition, and the
              agent identifies the right terpene profiles, matches them to real
              products, and shows you the evidence behind each recommendation.
            </p>
            <p className="text-sm text-warm-400 mb-8">
              This is a Cannavec Skill — a purpose-built interface designed to
              make the Cannabis Knowledge Base quick and easy to use. No prompt
              engineering needed. Just select and search.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#try-it"
                className="cannavec-btn-primary inline-flex items-center gap-2"
              >
                Try it below <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/pricing" className="cannavec-btn-secondary">
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-cannavec-900 mb-10">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <span className="font-mono text-3xl text-cannavec-200 shrink-0 leading-none">
                  {step}
                </span>
                <div>
                  <h3 className="font-medium text-cannavec-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-warm-500 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo */}
      <div id="try-it">
        <ProductLookupSection />
      </div>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-cannavec-900 mb-10">
            What you get
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-warm-50 rounded-xl border border-warm-200 p-5"
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

      {/* Why Skills? */}
      <section className="py-16 cannavec-gradient-subtle border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-2xl text-cannavec-900 mb-4">
              Why Skills?
            </h2>
            <p className="text-warm-500 leading-relaxed">
              The Cannabis Knowledge Base is powerful — but writing the right
              query takes time. Skills remove that friction. Each Skill is a
              controlled, purpose-built interface that guides you through the
              right inputs and delivers structured, evidence-based results.
              No prompt engineering. No ambiguity. Just the answer you need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            <div className="p-5 bg-white rounded-xl border border-warm-200">
              <div className="flex items-center gap-2 mb-3">
                <MonitorSmartphone className="w-5 h-5 text-cannavec-500" />
                <h3 className="font-medium text-cannavec-900 text-sm">
                  On cannavec.ai
                </h3>
              </div>
              <p className="text-xs text-warm-500 leading-relaxed">
                The full Skill experience — drop-downs, filters, and structured
                inputs that make it fast and easy. Create a free account to
                start using Skills through the web interface.
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-warm-200">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-5 h-5 text-cannavec-500" />
                <h3 className="font-medium text-cannavec-900 text-sm">
                  Via API &amp; MCP
                </h3>
              </div>
              <p className="text-xs text-warm-500 leading-relaxed">
                With API or MCP access, you can call Skills programmatically
                — embed Product Lookup into your own clinic platform, patient
                app, or AI workflow. Build your own interfaces on top of the
                same knowledge base.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cannavec-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl text-white mb-4">
            Ready to use Product Lookup?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
            Create a free account to use Skills on cannavec.ai. Upgrade to
            Individual or Company access for API and MCP — extend Skills
            into your own tools.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="cannavec-btn-accent inline-flex items-center gap-2"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 text-white/80 border border-white/20 rounded-lg hover:bg-white/5 transition-colors font-medium text-sm"
            >
              View pricing
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-6">
            Free accounts get 5 queries per day. API access from £50/month.
          </p>
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
