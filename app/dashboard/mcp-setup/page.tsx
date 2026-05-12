import { getAuthProfile } from "@/lib/dev-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ApiAccessGate } from "@/components/ApiAccessGate";
import { MpcSetupClient } from "./McpSetupClient";
import { hasPaidAccess } from "@/lib/tiers";
import { Menu } from "lucide-react";

export default async function McpSetupPage() {
  const profile = await getAuthProfile();
  const admin = createAdminClient();

  const isAdmin = profile.is_admin;
  const tier = profile.role;
  const canAccess = hasPaidAccess(tier, isAdmin);

  const { data: keys } = canAccess
    ? await admin
        .from("api_keys")
        .select("id, name, key_prefix")
        .eq("user_id", profile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <DashboardSidebar isAdmin={isAdmin} currentPath="/dashboard/mcp-setup" />

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

        <main className="flex-1 px-6 py-8 max-w-2xl">
          <ApiAccessGate hasAccess={canAccess}>
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-display font-semibold text-cannavec-900">
                  MCP Setup
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Connect Claude Desktop or Claude Code to the Cannavec Cannabis Knowledge Base.
                </p>
              </div>
              <MpcSetupClient keys={keys ?? []} />
            </div>
          </ApiAccessGate>
        </main>
      </div>
    </div>
  );
}
