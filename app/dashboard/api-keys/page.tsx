import { getAuthProfile } from "@/lib/dev-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ApiAccessGate } from "@/components/ApiAccessGate";
import { ApiKeysClient } from "./ApiKeysClient";
import { hasPaidAccess } from "@/lib/tiers";

export default async function ApiKeysPage() {
  const profile = await getAuthProfile();
  const admin = createAdminClient();

  const isAdmin = profile.is_admin;
  const tier = profile.role;
  const canAccess = hasPaidAccess(tier, isAdmin);

  const { data: keys } = canAccess
    ? await admin
        .from("api_keys")
        .select("id, name, key_prefix, is_active, created_at, last_used_at")
        .eq("user_id", profile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <DashboardSidebar isAdmin={isAdmin} currentPath="/dashboard/api-keys" />

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

        <main className="flex-1 px-6 py-8 max-w-4xl">
          <ApiAccessGate hasAccess={canAccess}>
            <ApiKeysClient keys={keys ?? []} />
          </ApiAccessGate>
        </main>
      </div>
    </div>
  );
}
