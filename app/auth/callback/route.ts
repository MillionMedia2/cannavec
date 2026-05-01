import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Persist signup metadata (user_role, org_name) into the profile row
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        const { full_name, role, org_name } = user.user_metadata;
        await supabase.from("profiles").update({
          ...(full_name && { full_name }),
          ...(role && { user_role: role }),
          ...(org_name && { org_name }),
        }).eq("id", user.id);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
