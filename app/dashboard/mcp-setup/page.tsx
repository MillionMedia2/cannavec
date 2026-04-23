import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MpcSetupClient } from "./McpSetupClient";

export default async function McpSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: keys } = await admin
    .from("api_keys")
    .select("id, name, key_prefix")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold text-cannavec-900">
          MCP Setup
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect Claude Desktop to the Cannavec Cannabis Knowledge Base.
        </p>
      </div>

      <MpcSetupClient keys={keys ?? []} />
    </div>
  );
}
