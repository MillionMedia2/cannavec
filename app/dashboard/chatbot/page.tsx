import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ChatbotClient } from "./ChatbotClient";

export default async function ChatbotPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return (
    <div className="h-screen bg-warm-50 flex overflow-hidden">
      <DashboardSidebar
        isAdmin={profile?.is_admin ?? false}
        currentPath="/dashboard/chatbot"
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatbotClient />
      </div>
    </div>
  );
}
