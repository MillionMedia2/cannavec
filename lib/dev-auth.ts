import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export interface AuthProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  org_name: string;
  is_admin: boolean;
  created_at: string;
}

const DEV_PROFILE: AuthProfile = {
  id: "00000000-0000-0000-0000-000000000000",
  full_name: "Dev User",
  email: "dev@localhost",
  role: "enterprise",
  org_name: "Dev Org",
  is_admin: true,
  created_at: new Date().toISOString(),
};

export async function getAuthProfile(): Promise<AuthProfile> {
  if (process.env.BYPASS_AUTH === "true") return DEV_PROFILE;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("full_name, email, role, org_name, is_admin, created_at")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    full_name: data?.full_name ?? user.email?.split("@")[0] ?? "there",
    email: data?.email ?? user.email ?? "",
    role: data?.role ?? "free",
    org_name: data?.org_name ?? "",
    is_admin: data?.is_admin ?? false,
    created_at: data?.created_at ?? "",
  };
}
