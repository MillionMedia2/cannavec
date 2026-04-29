"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bot, Key, Zap, Settings, LogOut, Plug, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  paidOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Chatbot", href: "/dashboard/chatbot", icon: Bot },
  { label: "Skills", href: "/dashboard/skills", icon: Zap },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "MCP Setup", href: "/dashboard/mcp-setup", icon: Plug },
  { label: "Account", href: "/dashboard/account", icon: User },
];

interface DashboardSidebarProps {
  isAdmin: boolean;
  currentPath?: string;
}

export function DashboardSidebar({ isAdmin, currentPath = "/dashboard" }: DashboardSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="hidden md:flex flex-col w-56 bg-cannavec-900 text-white shrink-0">
      <a href="/dashboard" className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
          <span className="text-white font-mono text-xs font-bold">cv</span>
        </div>
        <span className="font-display text-lg tracking-tight">cannavec</span>
        <span className="text-accent text-xs font-mono mt-0.5">.ai</span>
      </a>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPath === href
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </a>
        ))}

        {isAdmin && (
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors mt-4 border-t border-white/10 pt-4"
          >
            <Settings className="w-4 h-4" />
            Admin
          </a>
        )}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
