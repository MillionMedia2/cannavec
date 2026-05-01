import {
  Shield,
  Scale,
  Brain,
  FileCheck,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Editorially Governed",
    description:
      "Every record reviewed by named experts — not scraped from the internet. Evidence graded Level A, B, or C with full source citations.",
  },
  {
    icon: Scale,
    title: "Compliance-Safe Language",
    description:
      'Built for regulated environments. "Research suggests" and "may support" phrasing throughout. No medical claims. MHRA-aware.',
  },
  {
    icon: Brain,
    title: "RAG-Optimised Chunks",
    description:
      "300-800 word self-contained chunks with embedded retrieval questions. Built for AI, not repurposed from PDFs.",
  },
  {
    icon: FileCheck,
    title: "Evidence Graded A/B/C",
    description:
      "Level A: RCTs and meta-analyses. Level B: Observational studies. Level C: Expert opinion. You always know the strength of evidence.",
  },
  {
    icon: Users,
    title: "Patient-First Editorial Board",
    description:
      "Governed by patients, advocates and researchers — not pharma companies. Independent. Transparent. No conflicts of interest.",
  },
  {
    icon: Globe,
    title: "Global",
    description:
      "We write for the global cannabis supply market.",
  },
];

export function ValuePropSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
            Not another dataset.
            <br />A knowledge foundation.
          </h2>
          <p className="text-lg text-warm-500">
            Other providers sell market data — what&apos;s selling, where, for how much. We
            provide the science underneath: mechanisms, evidence, clinical
            protocols, safety data, drug interactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-warm-200 hover:border-cannavec-200 bg-white hover:bg-cannavec-50/30 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-cannavec-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cannavec-100 transition-colors">
                <feature.icon size={20} className="text-cannavec-500" />
              </div>
              <h3 className="text-lg font-display text-cannavec-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-warm-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
