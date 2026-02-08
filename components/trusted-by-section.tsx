import { Stethoscope, Cpu, Beaker, BarChart3 } from "lucide-react";

const useCases = [
  {
    icon: Stethoscope,
    audience: "Clinics & Prescribers",
    headline: "Clinical intelligence behind patient consultations",
    description:
      "Power your prescribing platform with evidence-graded information about cannabinoid mechanisms, dosing protocols, drug interactions and safety data. Compliance-safe language throughout.",
    example: "\"What are the evidence-based dosing protocols for CBD in anxiety?\"",
  },
  {
    icon: Cpu,
    audience: "Tech Platforms & AI Products",
    headline: "Plug verified cannabis science into your AI",
    description:
      "Replace unreliable web-scraped data with editorially governed, RAG-optimised knowledge chunks. Every response your AI gives is backed by cited evidence.",
    example: "\"Return all Level A evidence for THC in neuropathic pain\"",
  },
  {
    icon: Beaker,
    audience: "Brands & Producers",
    headline: "Compliance-safe product knowledge layer",
    description:
      "Enrich your product pages and customer support with scientifically accurate descriptions of terpene profiles, cannabinoid effects and consumption methods.",
    example: "\"What terpenes are associated with sedative effects?\"",
  },
  {
    icon: BarChart3,
    audience: "Analysts & Researchers",
    headline: "Structured evidence for cannabis research",
    description:
      "Access systematically organised clinical evidence, categorised by condition, cannabinoid, evidence level and mechanism. Export-ready for research pipelines.",
    example: "\"List all clinical trials for cannabis in epilepsy since 2020\"",
  },
];

export function TrustedBySection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
            Built for every part
            <br />
            of the industry.
          </h2>
          <p className="text-lg text-warm-500">
            Whether you&apos;re prescribing to patients, building AI products,
            formulating brands or analysing markets — Cannavec is the
            knowledge layer you&apos;re missing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((uc, i) => (
            <div
              key={i}
              className="group p-8 rounded-xl border border-warm-200 hover:border-cannavec-200 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cannavec-50 rounded-lg flex items-center justify-center group-hover:bg-cannavec-100 transition-colors">
                  <uc.icon size={20} className="text-cannavec-500" />
                </div>
                <span className="text-xs font-medium text-cannavec-500 uppercase tracking-wider">
                  {uc.audience}
                </span>
              </div>
              <h3 className="text-xl font-display text-cannavec-900 mb-3">
                {uc.headline}
              </h3>
              <p className="text-sm text-warm-500 leading-relaxed mb-4">
                {uc.description}
              </p>
              <div className="px-4 py-3 bg-cannavec-950 rounded-lg">
                <code className="text-xs text-accent-light font-mono">
                  {uc.example}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
