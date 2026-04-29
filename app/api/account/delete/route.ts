import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = createAdminClient();

  // Revoke all API keys
  await admin.from("api_keys").update({ is_active: false }).eq("user_id", user.id);

  // Delete profile (cascades from auth.users FK)
  await admin.from("profiles").delete().eq("id", user.id);

  // Delete auth user
  await admin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ ok: true });
}
