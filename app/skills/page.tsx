import type { Metadata } from "next";
import Link from "next/link";
import {
  Search, Scale, FileCheck, GitCompare, Filter,
  FlaskConical, Package, Stethoscope, Pill, ArrowRight, Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Skills — Cannavec",
  description:
    "Purpose-built tools for accessing the Cannabis Knowledge Foundation knowledge base. Evidence-based skills for clinicians, platforms, and researchers.",
};

const SKILLS = [
  {
    icon: Search,
    name: "Knowledge Base Search",
    description: "Search the full CKF knowledge base — FAQ entries ground the answer, then the full evidence base provides clinical detail, research data, and evidence grades.",
    tier: "Free",
    tierClass: "bg-warm-100 text-warm-600",
    status: "live" as const,
    href: null,
    mcpEligible: true,
  },
  {
    icon: Scale,
    name: "Regulatory Overview",
    description: "Get jurisdiction-specific regulatory status for cannabis — legal framework, scheduling, and prescribing rules for any country.",
    tier: "Free",
    tierClass: "bg-warm-100 text-warm-600",
    status: "live" as const,
    href: null,
    mcpEligible: true,
  },
  {
    icon: Package,
    name: "Product Lookup",
    description: "Search the UK/EU cannabis products database — product details, THC/CBD content, terpene profiles, and jurisdiction availability. Cross-referenced against the evidence base.",
    tier: "Startup",
    tierClass: "bg-blue-50 text-blue-700",
    status: "live" as const,
    href: "/skills/product-lookup",
    mcpEligible: true,
  },
  {
    icon: FileCheck,
    name: "CoA Analyser",
    description: "Upload a Certificate of Analysis PDF and receive a structured breakdown of cannabinoids, terpenes, residual solvents, heavy metals, and microbials.",
    tier: "Free",
    tierClass: "bg-warm-100 text-warm-600",
    status: "coming_soon" as const,
    href: null,
    mcpEligible: true,
  },
  {
    icon: GitCompare,
    name: "Jurisdiction Comparison",
    description: "Side-by-side regulatory comparison across multiple countries — legal status, scheduling, and access pathways in a structured table.",
    tier: "Free",
    tierClass: "bg-warm-100 text-warm-600",
    status: "coming_soon" as const,
    href: null,
    mcpEligible: true,
  },
  {
    icon: Filter,
    name: "Evidence Grade Filter",
    description: "Search the knowledge base filtered by evidence grade (A, B, C, D). Ideal for clinicians who need only the highest-quality research.",
    tier: "Advocacy",
    tierClass: "bg-cannavec-100 text-cannavec-700",
    status: "coming_soon" as const,
    href: null,
    mcpEligible: true,
  },
  {
    icon: FlaskConical,
    name: "Strain Selector",
    description: "Match cannabis cultivars to a patient's symptom profile, tolerance level, and terpene preferences. Interactive wizard with ranked suggestions.",
    tier: "Advocacy",
    tierClass: "bg-cannavec-100 text-cannavec-700",
    status: "coming_soon" as const,
    href: null,
    mcpEligible: false,
  },
  {
    icon: Stethoscope,
    name: "Clinical Summary",
    description: "Generate a structured clinical briefing — indication, mechanism, evidence summary, dosing considerations, and contraindications.",
    tier: "Professional",
    tierClass: "bg-purple-50 text-purple-700",
    status: "coming_soon" as const,
    href: null,
    mcpEligible: true,
  },
  {
    icon: Pill,
    name: "Dosing Assistant",
    description: "Evidence-based starting dose ranges for cannabinoid products given a patient's condition, body weight, and prior exposure. Includes citations and safety caveats.",
    tier: "Professional",
    tierClass: "bg-purple-50 text-purple-700",
    status: "coming_soon" as const,
    href: null,
    mcpEligible: true,
  },
];

export default function SkillsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cannavec-50 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5 text-cannavec-500" />
              <span className="text-xs font-medium text-cannavec-600 tracking-wide">CANNAVEC SKILLS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display text-cannavec-900 mb-4">
              Purpose-built tools for the Cannabis Knowledge Base
            </h1>
            <p className="text-lg text-warm-500 mb-8">
              Skills are specialist tools that go beyond search — each one is designed for a specific clinical, regulatory, or research workflow. MCP-eligible Skills can be used directly from Claude Desktop, Cursor, and other AI tools.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/signup" className="cannavec-btn-primary inline-flex items-center gap-2">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="cannavec-btn-secondary">
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills grid */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map((skill) => {
              const card = (
                <div className={`bg-white rounded-xl border p-5 flex flex-col gap-3 h-full transition-all ${
                  skill.status === "coming_soon"
                    ? "opacity-70 border-warm-200"
                    : skill.href
                    ? "border-warm-200 hover:border-[#8a9a5a] hover:shadow-sm group"
                    : "border-warm-200"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 bg-[#f5f7f0] rounded-lg flex items-center justify-center">
                      <skill.icon className={`w-5 h-5 ${skill.status === "live" ? "text-[#8a9a5a]" : "text-warm-400"}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {skill.mcpEligible && (
                        <span className="text-[10px] font-mono bg-cannavec-50 text-cannavec-600 px-1.5 py-0.5 rounded">MCP</span>
                      )}
                      {skill.status === "live" ? (
                        <span className="text-xs font-medium bg-[#f5f7f0] text-[#8a9a5a] px-2 py-0.5 rounded-full">Live</span>
                      ) : (
                        <span className="text-xs font-medium bg-warm-100 text-warm-400 px-2 py-0.5 rounded-full">Coming soon</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-cannavec-900 mb-1">{skill.name}</h3>
                    <p className="text-sm text-warm-500 leading-relaxed">{skill.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${skill.tierClass}`}>
                      {skill.tier}
                    </span>
                    {skill.href && skill.status === "live" && (
                      <span className="flex items-center gap-1 text-xs text-[#8a9a5a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );

              return skill.href && skill.status === "live" ? (
                <Link key={skill.name} href={skill.href} className="flex">{card}</Link>
              ) : (
                <div key={skill.name} className="flex">{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MCP callout */}
      <section className="py-16 bg-white border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono bg-cannavec-50 text-cannavec-600 px-2 py-0.5 rounded">MCP</span>
            <h2 className="font-display text-2xl text-cannavec-900 mt-3 mb-3">Use Skills from your AI tools</h2>
            <p className="text-warm-500 text-sm mb-6">
              MCP-eligible Skills connect directly to Claude Desktop, Cursor, and any MCP-compatible tool — bringing the Cannabis Knowledge Base into your existing workflow without switching tabs.
            </p>
            <Link href="/dashboard/mcp-setup" className="cannavec-btn-secondary inline-flex items-center gap-2">
              MCP Setup guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
