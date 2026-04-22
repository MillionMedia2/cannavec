import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Key, Bot, Zap, BarChart3, Settings, LogOut, Menu } from "lucide-react";

const PLACEHOLDER_CARDS = [
  {
    icon: Bot,
    title: "Cannabis KB Chatbot",
    description: "Ask questions about cannabis science, evidence grades, and clinical guidance — powered by the CKF knowledge base.",
    badge: "Coming soon",
  },
  {
    icon: Key,
    title: "API Keys",
    description: "Generate and manage your personal API keys. Each key is scoped to your tier and tracks usage.",
    badge: "Coming soon",
  },
  {
    icon: Zap,
    title: "Skills",
    description: "Pre-built workflows for CoA analysis, strain selection, regulatory checks, and more — usable inside Claude Desktop.",
    badge: "Coming soon",
  },
  {
    icon: BarChart3,
    title: "Usage",
    description: "Monitor your API usage, query history, and remaining monthly allowance in real time.",
    badge: "Coming soon",
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

  const { data: profile } = await supabase
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
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-cannavec-900 text-white shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
            <span className="text-white font-mono text-xs font-bold">cv</span>
          </div>
          <span className="font-display text-lg tracking-tight">cannavec</span>
          <span className="text-accent text-xs font-mono mt-0.5">.ai</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: "Dashboard", href: "/dashboard", icon: BarChart3, active: true },
            { label: "Chatbot", href: "/dashboard/chatbot", icon: Bot },
            { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
            { label: "Skills", href: "/dashboard/skills", icon: Zap },
            { label: "Usage", href: "/dashboard/usage", icon: BarChart3 },
            { label: "Account", href: "/dashboard/account", icon: Settings },
          ].map(({ label, href, icon: Icon, active }) => (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          ))}

          {profile?.is_admin && (
            <a
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors mt-4 border-t border-white/10 pt-4"
            >
              <Settings className="w-4 h-4" />
              Admin
            </a>
          )}
        </nav>

        <form action="/auth/signout" method="post" className="px-3 pb-4">
          <a
            href="/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full"
            onClick={async (e) => {
              e.preventDefault();
              const { createClient } = await import("@/lib/supabase/client");
              const sb = createClient();
              await sb.auth.signOut();
              window.location.href = "/";
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </a>
        </form>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
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

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLACEHOLDER_CARDS.map(({ icon: Icon, title, description, badge }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-warm-200 p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-cannavec-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cannavec-500" />
                  </div>
                  <span className="text-xs font-medium bg-warm-100 text-warm-500 px-2 py-0.5 rounded-full">
                    {badge}
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
