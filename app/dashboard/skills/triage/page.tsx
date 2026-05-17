import { getAuthProfile } from "@/lib/dev-auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { TriageSection } from "@/components/triage-section";
import { ClipboardCheck } from "lucide-react";

export default async function DashboardTriagePage() {
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
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-[#f5f7f0] rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-[#8a9a5a]" />
              </div>
              <h1 className="font-display text-2xl text-cannavec-900">Free Eligibility Check</h1>
            </div>
            <p className="text-sm text-warm-500 mt-1 ml-11">
              A patient-facing triage workflow for UK medical cannabis eligibility. Answers a few questions, produces an evidence-grounded verdict, and books a clinic call. Designed to embed on plantz.io and white-label for clinics.
            </p>
          </div>
          <TriageSection />
        </main>
      </div>
    </div>
  );
}
