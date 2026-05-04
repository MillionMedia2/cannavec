import { getAuthProfile } from "@/lib/dev-auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ProductLookupSection } from "@/components/product-lookup-section";

export default async function DashboardProductLookupPage() {
  const profile = await getAuthProfile();

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <DashboardSidebar isAdmin={profile.is_admin} currentPath="/dashboard/skills" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-warm-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-mono text-xs font-bold">cv</span>
            </div>
            <span className="font-display text-lg text-cannavec-900">cannavec</span>
          </div>
        </header>

        <main className="flex-1">
          <div className="px-6 pt-8 pb-2">
            <h1 className="font-display text-2xl text-cannavec-900">Product Lookup</h1>
            <p className="text-sm text-warm-500 mt-1">
              Search the UK/EU cannabis products database — cross-referenced against the clinical evidence base.
            </p>
          </div>
          <ProductLookupSection authenticated={true} />
        </main>
      </div>
    </div>
  );
}
