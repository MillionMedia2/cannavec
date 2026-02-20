import { Check, X } from "lucide-react";

export function BuildVsBuySection() {
  return (
    <section className="py-20 sm:py-28 cannavec-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
            Why build your own?
          </h2>
          <p className="text-lg text-warm-500">
            Building an equivalent knowledge base in-house costs £280K–£460K in the
            first year and takes 12+ months. Or you could be live this week.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
          <div className="p-8 rounded-xl bg-white border border-warm-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <X size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-display text-cannavec-900">Build In-House</h3>
                <p className="text-sm text-warm-400">DIY Knowledge Base</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { label: "Medical writers & researchers", cost: "£120K–£180K" },
                { label: "Data engineering & vector infrastructure", cost: "£80K–£120K" },
                { label: "Editorial governance & review", cost: "£40K–£60K" },
                { label: "Regulatory compliance review", cost: "£20K–£40K" },
                { label: "Ongoing maintenance & updates", cost: "£20K–£60K" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-warm-100">
                  <span className="text-sm text-warm-500">{item.label}</span>
                  <span className="text-sm font-mono font-medium text-red-600">{item.cost}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">Total Year 1 Cost</span>
                <span className="text-xl font-display text-red-700">£280K–£460K</span>
              </div>
              <p className="text-xs text-red-500 mt-1">+ 12–18 months before first query</p>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-cannavec-900 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 bg-accent rounded-full">
              <span className="text-xs font-medium text-white">Recommended</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Check size={20} className="text-accent-light" />
              </div>
              <div>
                <h3 className="text-lg font-display">Cannavec API</h3>
                <p className="text-sm text-white/60">Enterprise Tier</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { label: "Thousands of verified records, immediately", included: true },
                { label: "Editorial governance by named experts", included: true },
                { label: "Evidence grading (A/B/C) on every record", included: true },
                { label: "RAG-optimised for AI integration", included: true },
                { label: "UK/EU regulatory context built in", included: true },
                { label: "Continuous updates & new research", included: true },
                { label: "Priority support & SLA", included: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/10">
                  <Check size={16} className="text-accent-light shrink-0" />
                  <span className="text-sm text-white/80">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Annual Cost</span>
                <span className="text-xl font-display text-accent-light">£120K/year</span>
              </div>
              <p className="text-xs text-white/50 mt-1">Live today. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
