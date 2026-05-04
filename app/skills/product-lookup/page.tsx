import type { Metadata } from "next";
import Link from "next/link";
import { Package, Leaf, Droplets, Pill, FlaskConical, ArrowRight, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Lookup — Cannavec Skills",
  description:
    "Search the UK/EU cannabis products database by condition. Evidence-based product recommendations with terpene matching and clinical reasoning. Available to registered Cannavec users.",
};

const FEATURES = [
  {
    icon: Package,
    title: "805+ UK/EU products",
    description: "Covers the full regulated medical cannabis product database — flower, oil, capsules, and cartridges.",
  },
  {
    icon: Leaf,
    title: "Evidence-matched terpenes",
    description: "Cross-references the cannabis knowledge base to identify terpene profiles relevant to your condition.",
  },
  {
    icon: Droplets,
    title: "THC/CBD content",
    description: "Full cannabinoid profiles, potency ratings, strain names, and form-factor details for every product.",
  },
  {
    icon: Pill,
    title: "Clinical reasoning",
    description: "Evidence summaries explain why products are recommended, grounded in the CKF knowledge base.",
  },
];

const PRODUCT_FORMS = ["Flower", "Oil", "Capsules", "Cartridges"];

export default function ProductLookupMarketingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cannavec-50 rounded-full mb-4">
              <span className="text-xs font-medium text-cannavec-600 tracking-wide">CANNAVEC SKILLS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
              Product Lookup
            </h1>
            <p className="text-lg text-warm-500 mb-8">
              Search the UK/EU regulated cannabis products database — cross-referenced against the clinical evidence base to surface the right products for any condition.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="cannavec-btn-primary inline-flex items-center gap-2"
              >
                Get access <ArrowRight className="w-4 h-4" />
              </Link>
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
          <h2 className="font-display text-2xl text-cannavec-900 mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-warm-500">
            {[
              { step: "01", title: "Enter a condition", body: "Type any condition — chronic pain, insomnia, anxiety, spasticity — and optionally filter by product form." },
              { step: "02", title: "Evidence base consulted", body: "The CKF knowledge base is searched to identify relevant terpene profiles and cannabinoid ratios backed by clinical evidence." },
              { step: "03", title: "Matching products returned", body: "Products from the UK/EU database are ranked by relevance and presented with full cannabinoid and terpene data." },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <span className="font-mono text-cannavec-300 text-sm shrink-0 mt-0.5">{step}</span>
                <div>
                  <h3 className="font-medium text-cannavec-900 mb-1">{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-cannavec-900 mb-10">What's included</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl border border-warm-200 p-5">
                <div className="w-9 h-9 bg-[#f5f7f0] rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#8a9a5a]" />
                </div>
                <h3 className="font-medium text-cannavec-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-warm-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product forms */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-cannavec-900 mb-4">Supported product forms</h2>
          <p className="text-warm-500 text-sm mb-8">Filter results to the product form that suits your patient or use case.</p>
          <div className="flex flex-wrap gap-3">
            {PRODUCT_FORMS.map((form) => (
              <span key={form} className="px-4 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm text-warm-600 font-medium">
                {form}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 cannavec-gradient-subtle border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-cannavec-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-xl text-cannavec-900 mb-1">Available to registered users</h2>
              <p className="text-warm-500 text-sm">Product Lookup is part of the Cannavec Skills suite, available from the Startup tier and above.</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/auth/signup" className="cannavec-btn-primary inline-flex items-center gap-2">
              Sign up <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/skills" className="cannavec-btn-secondary">
              All Skills
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
