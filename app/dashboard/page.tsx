import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Key, Bot, Zap, BarChart3, Plug, ArrowRight } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import Link from "next/link";

const LIVE_CARDS = [
  {
    icon: Bot,
    title: "Knowledge Base Chatbot",
    description: "Ask questions about cannabis science, evidence grades, and clinical guidance — powered by the CKF knowledge base.",
    href: "/dashboard/chatbot",
    badge: "Live",
  },
  {
    icon: Key,
    title: "API Keys",
    description: "Generate and manage your personal API keys for direct access to the search API.",
    href: "/dashboard/api-keys",
    badge: "Live",
  },
  {
    icon: Plug,
    title: "MCP Setup",
    description: "Connect the Cannabis Knowledge Base directly to Claude Desktop using your API key.",
    href: "/dashboard/mcp-setup",
    badge: "Live",
  },
];

const COMING_CARDS = [
  {
    icon: Zap,
    title: "Skills",
    description: "Pre-built workflows for CoA analysis, strain selection, regulatory checks, and more.",
  },
  {
    icon: BarChart3,
    title: "Usage",
    description: "Monitor your API usage, query history, and remaining monthly allowance in real time.",
  },
];

const TIER_COLOURS: Record<string, string> = {
  free: "bg-warm-100 text-warm-600",
  advocacy: "bg-cannavec-100 text-cannavec-700",
  startup: "bg-blue-50 text-blue-700",
  professional: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700",
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, role, is_admin")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email?.split("@")[0] || "there";
  const tier = profile?.role ?? "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const tierClass = TIER_COLOURS[tier] ?? TIER_COLOURS.free;

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <DashboardSidebar isAdmin={profile?.is_admin ?? false} currentPath="/dashboard" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-warm-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-mono text-xs font-bold">cv</span>
            </div>
            <span className="font-display text-lg text-cannavec-900">cannavec</span>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl">
          {/* Welcome panel */}
          <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl text-cannavec-900 mb-1">
                Welcome back, {displayName}
              </h1>
              <p className="text-warm-500 text-sm">
                Your Cannabis Knowledge Foundation workspace
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tierClass}`}>
              {tierLabel}
            </span>
          </div>

          {/* Live features */}
          <h2 className="text-xs font-semibold uppercase tracking-wide text-warm-400 mb-3">
            Available now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {LIVE_CARDS.map(({ icon: Icon, title, description, href, badge }) => (
              <Link
                key={title}
                href={href}
                className="group bg-white rounded-xl border border-warm-200 p-5 flex flex-col gap-3 hover:border-[#8a9a5a] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-[#f5f7f0] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#8a9a5a]" />
                  </div>
                  <span className="text-xs font-medium bg-[#f5f7f0] text-[#8a9a5a] px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-cannavec-900 mb-1">{title}</h3>
                  <p className="text-sm text-warm-500 leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#8a9a5a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>

          {/* Coming soon */}
          <h2 className="text-xs font-semibold uppercase tracking-wide text-warm-400 mb-3">
            Coming soon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMING_CARDS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-warm-200 p-5 flex flex-col gap-3 opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-cannavec-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cannavec-400" />
                  </div>
                  <span className="text-xs font-medium bg-warm-100 text-warm-400 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-cannavec-900 mb-1">{title}</h3>
                  <p className="text-sm text-warm-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
