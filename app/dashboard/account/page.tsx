import { getAuthProfile } from "@/lib/dev-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AccountClient } from "./AccountClient";
import { hasPaidAccess } from "@/lib/tiers";
import { Menu } from "lucide-react";

export default async function AccountPage() {
  const profile = await getAuthProfile();
  const admin = createAdminClient();

  const tier = profile.role;
  const isAdmin = profile.is_admin;
  const canAccessApi = hasPaidAccess(tier, isAdmin);

  const { count: keyCount } = canAccessApi
    ? await admin
        .from("api_keys")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("is_active", true)
    : { count: 0 };

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <DashboardSidebar isAdmin={isAdmin} currentPath="/dashboard/account" />

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

        <main className="flex-1 px-6 py-8 max-w-lg">
          <AccountClient
            profile={{
              fullName: profile.full_name,
              email: profile.email,
              orgName: profile.org_name,
              role: tier,
              isAdmin,
              createdAt: profile.created_at,
            }}
            activeKeyCount={keyCount ?? 0}
            canAccessApi={canAccessApi}
          />
        </main>
      </div>
    </div>
  );
}
