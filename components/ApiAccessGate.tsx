import { Key, Plug, Zap, Lock, Sparkles, ArrowRight } from "lucide-react";

const BENEFITS = [
  {
    icon: Key,
    title: "Personal API Keys",
    description: "Generate secure API keys scoped to your account. Integrate the Cannabis Knowledge Base directly into your own tools, scripts, and workflows.",
  },
  {
    icon: Plug,
    title: "MCP for Claude Desktop",
    description: "Connect Claude Desktop to the Cannabis Knowledge Base with a single config block. Ask cannabis research questions directly from your AI workspace.",
  },
  {
    icon: Zap,
    title: "All MCP Skills",
    description: "Access every MCP-eligible Skill — regulatory checks, evidence grade filters, clinical summaries — from any MCP-compatible AI client.",
  },
  {
    icon: Sparkles,
    title: "Priority Access",
    description: "Higher query limits, access to premium namespaces including product data and natural remedies, and early access to new Skills.",
  },
];

interface ApiAccessGateProps {
  hasAccess: boolean;
  children: React.ReactNode;
}

export function ApiAccessGate({ hasAccess, children }: ApiAccessGateProps) {
  if (hasAccess) return <>{children}</>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f5f7f0] flex items-center justify-center">
          <Lock className="w-7 h-7 text-[#8a9a5a]" />
        </div>
        <h1 className="font-display text-2xl text-cannavec-900 mb-2">
          Unlock API &amp; MCP Access
        </h1>
        <p className="text-sm text-warm-500 max-w-md mx-auto">
          Paid members get direct API access to the Cannabis Knowledge Base and can
          connect it to Claude Desktop, Cursor, and other AI tools via MCP.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-warm-200 p-5 flex flex-col gap-3"
          >
            <div className="w-9 h-9 bg-[#f5f7f0] rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#8a9a5a]" />
            </div>
            <h3 className="font-medium text-cannavec-900 text-sm">{title}</h3>
            <p className="text-xs text-warm-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          disabled
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-warm-100 text-warm-400 cursor-not-allowed"
        >
          Coming Soon
        </button>
        <p className="text-xs text-warm-400 mt-3">
          Paid plans will be available soon. Contact neil@plantz.io for early access.
        </p>
      </div>
    </div>
  );
}
