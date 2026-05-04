import { getAuthProfile } from "@/lib/dev-auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ChatbotClient } from "./ChatbotClient";

export default async function ChatbotPage() {
  const profile = await getAuthProfile();

  return (
    <div className="h-screen bg-warm-50 flex overflow-hidden">
      <DashboardSidebar
        isAdmin={profile.is_admin}
        currentPath="/dashboard/chatbot"
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatbotClient />
      </div>
    </div>
  );
}
