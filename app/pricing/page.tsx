import { Check, ArrowRight, Zap, Building2, Rocket, Heart } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Cannavec API",
  description: "API pricing from £750/month for startups to enterprise. Evidence-based cannabis knowledge at every scale.",
};

const tiers = [
  {
    name: "Advocacy",
    icon: Heart,
    price: "£10–£100",
    period: "/month",
    description: "For patient groups, charities, and researchers advancing cannabis access.",
    features: [
      "5,000 API calls/month",
      "Full namespace access",
      "Community support",
      "Case-by-case pricing",
      "Community contribution encouraged",
    ],
    cta: "Apply for Access",
    ctaHref: "/contact",
    highlight: false,
    badge: null,
  },
  {
    name: "Startup",
    icon: Rocket,
    price: "£750",
    period: "/month",
    description: "For early-stage companies, small clinics and CBD brands getting started.",
    features: [
      "10,000 API calls/month",
      "Full namespace access",
      "Community support",
      "Rate-limited (30 req/min)",
      "Monthly usage reports",
    ],
    cta: "Get Started",
    ctaHref: "#",
    highlight: false,
    badge: null,
  },
  {
    name: "Professional",
    icon: Zap,
    price: "£3,000",
    period: "/month",
    description: "For mid-size clinics, consultancies and cannabis brands scaling up.",
    features: [
      "50,000 API calls/month",
      "Full namespace access",
      "Standard support",
      "Rate-limited (60 req/min)",
      "Monthly usage reports",
      "Webhook notifications",
    ],
    cta: "Get Started",
    ctaHref: "#",
    highlight: false,
    badge: "Popular",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Contact Us",
    period: "",
    description: "For MSOs, pharma, tech platforms and large clinic networks. Custom pricing to fit your scale.",
    features: [
      "Unlimited API calls",
      "Priority support + SLA",
      "Custom namespace access",
      "Co-branding options",
      "Early access to new data",
      "Named account manager",
      "Quarterly knowledge reviews",
      "100 req/min",
    ],
    cta: "Talk to Us",
    ctaHref: "/contact",
    highlight: true,
    badge: "Best Value",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="py-20 sm:py-28 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display text-cannavec-900 mb-6">
              Simple, transparent pricing.
            </h1>
            <p className="text-lg text-warm-500">
              From advocacy groups at £10/month to full enterprise.
              Every tier gets the same verified knowledge — just more of it.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  tier.highlight
                    ? "bg-cannavec-900 border-cannavec-600 text-white shadow-xl scale-[1.02]"
                    : "bg-white border-warm-200 hover:border-cannavec-200"
                }`}
              >
                {tier.badge && (
                  <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-medium ${tier.highlight ? "bg-accent text-white" : "bg-cannavec-500 text-white"}`}>
                    {tier.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <tier.icon size={20} className={tier.highlight ? "text-accent-light" : "text-cannavec-500"} />
                  <h3 className={`text-lg font-display ${tier.highlight ? "text-white" : "text-cannavec-900"}`}>{tier.name}</h3>
                </div>

                <div className="mb-4">
                  <span className={`text-3xl font-display ${tier.highlight ? "text-white" : "text-cannavec-900"}`}>{tier.price}</span>
                  <span className={`text-sm ${tier.highlight ? "text-white/60" : "text-warm-400"}`}>{tier.period}</span>
                </div>

                <p className={`text-sm mb-6 ${tier.highlight ? "text-white/70" : "text-warm-500"}`}>{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check size={16} className={`mt-0.5 shrink-0 ${tier.highlight ? "text-accent-light" : "text-cannavec-500"}`} />
                      <span className={`text-sm ${tier.highlight ? "text-white/80" : "text-warm-500"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.ctaHref}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium text-sm transition-all ${
                    tier.highlight ? "bg-accent text-white hover:bg-accent-dark" : "bg-cannavec-500 text-white hover:bg-cannavec-600"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-warm-400">
              Annual billing available — save up to 20%.{" "}
              <Link href="/contact" className="text-cannavec-500 hover:underline">Contact us for annual pricing →</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display text-cannavec-900 mb-8">Every tier includes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Hundreds of Cannabis Records", desc: "Clinical evidence, mechanisms, dosing, safety data" },
              { title: "Hundreds of Product Records", desc: "UK/EU cannabis products with verified data" },
              { title: "Evidence Grading", desc: "Every record graded Level A, B, or C" },
              { title: "Full Citations", desc: "Source, date, and study type on every claim" },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-cannavec-50/50 rounded-lg">
                <h4 className="text-sm font-medium text-cannavec-900 mb-1">{item.title}</h4>
                <p className="text-xs text-warm-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
