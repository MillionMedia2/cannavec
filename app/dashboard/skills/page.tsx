import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Menu, Search, FileCheck, Scale, GitCompare, FlaskConical, Filter, Package, Stethoscope, Pill, Zap } from "lucide-react";

interface SkillTile {
  icon: any;
  name: string;
  description: string;
  tier: string;
  status: "live" | "coming_soon";
  mcpEligible: boolean;
}

const SKILLS: SkillTile[] = [
  {
    icon: Search,
    name: "Knowledge Base Search",
    description: "Search the full Cannabis Knowledge Base — FAQ entries ground the answer, then the full evidence base provides clinical detail, research data, and evidence grades.",
    tier: "Free",
    status: "live",
    mcpEligible: true,
  },
  {
    icon: Scale,
    name: "Regulatory Overview",
    description: "Get jurisdiction-specific regulatory status for cannabis — legal framework, scheduling, and prescribing rules for any country.",
    tier: "Free",
    status: "live",
    mcpEligible: true,
  },
  {
    icon: FileCheck,
    name: "CoA Analyser",
    description: "Upload a Certificate of Analysis PDF and receive a structured breakdown of cannabinoids, terpenes, residual solvents, heavy metals, and microbials.",
    tier: "Free",
    status: "coming_soon",
    mcpEligible: true,
  },
  {
    icon: GitCompare,
    name: "Jurisdiction Comparison",
    description: "Side-by-side regulatory comparison across multiple countries — legal status, scheduling, and access pathways in a structured table.",
    tier: "Free",
    status: "coming_soon",
    mcpEligible: true,
  },
  {
    icon: Filter,
    name: "Evidence Grade Filter",
    description: "Search the KB filtered by evidence grade (A, B, C, D). Ideal for clinicians who need only the highest-quality research.",
    tier: "Advocacy",
    status: "coming_soon",
    mcpEligible: true,
  },
  {
    icon: FlaskConical,
    name: "Strain Selector",
    description: "Match cannabis cultivars to a patient's symptom profile, tolerance level, and terpene preferences. Interactive wizard with ranked suggestions.",
    tier: "Advocacy",
    status: "coming_soon",
    mcpEligible: false,
  },
  {
    icon: Package,
    name: "Product Lookup",
    description: "Search the UK/EU cannabis products database — product details, THC/CBD content, terpene profiles, and jurisdiction availability.",
    tier: "Startup",
    status: "coming_soon",
    mcpEligible: true,
  },
  {
    icon: Stethoscope,
    name: "Clinical Summary",
    description: "Generate a structured clinical briefing — indication, mechanism, evidence summary, dosing considerations, and contraindications.",
    tier: "Professional",
    status: "coming_soon",
    mcpEligible: true,
  },
  {
    icon: Pill,
    name: "Dosing Assistant",
    description: "Evidence-based starting dose ranges for cannabinoid products given a patient's condition, body weight, and prior exposure. Includes citations and safety caveats.",
    tier: "Professional",
    status: "coming_soon",
    mcpEligible: true,
  },
];

const TIER_BADGE: Record<string, string> = {
  Free: "bg-warm-100 text-warm-600",
  Advocacy: "bg-cannavec-100 text-cannavec-700",
  Startup: "bg-blue-50 text-blue-700",
  Professional: "bg-purple-50 text-purple-700",
};

export default async function SkillsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <DashboardSidebar isAdmin={profile?.is_admin ?? false} currentPath="/dashboard/skills" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-warm-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-mono text-xs font-bold">cv</span>
            </div>
            <span className="font-display text-lg text-cannavec-900">cannavec</span>
          </div>
          <button className="p-2 text-warm-500">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#f5f7f0] rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#8a9a5a]" />
              </div>
              <h1 className="font-display text-2xl text-cannavec-900">Skills</h1>
            </div>
            <p className="text-sm text-warm-500 max-w-xl">
              Skills are purpose-built tools for accessing the Cannabis Knowledge Base.
              Each Skill is designed for a specific type of question or workflow.
              MCP-eligible Skills can also be used from Claude Desktop, Cursor, and other AI tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map((skill) => (
              <div
                key={skill.name}
                className={`bg-white rounded-xl border border-warm-200 p-5 flex flex-col gap-3 ${
                  skill.status === "coming_soon" ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-[#f5f7f0] rounded-lg flex items-center justify-center">
                    <skill.icon className={`w-5 h-5 ${
                      skill.status === "live" ? "text-[#8a9a5a]" : "text-warm-400"
                    }`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {skill.mcpEligible && (
                      <span className="text-[10px] font-mono bg-cannavec-50 text-cannavec-600 px-1.5 py-0.5 rounded">
                        MCP
                      </span>
                    )}
                    {skill.status === "live" ? (
                      <span className="text-xs font-medium bg-[#f5f7f0] text-[#8a9a5a] px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-warm-100 text-warm-400 px-2 py-0.5 rounded-full">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-cannavec-900 text-sm mb-1">{skill.name}</h3>
                  <p className="text-xs text-warm-500 leading-relaxed">{skill.description}</p>
                </div>
                <div className="pt-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TIER_BADGE[skill.tier] ?? TIER_BADGE.Free}`}>
                    {skill.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
