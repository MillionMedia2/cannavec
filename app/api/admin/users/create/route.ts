import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = createAdminClient();
  const { data: caller } = await admin.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!caller?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, full_name, role, user_role, org_name } = await request.json();

  // Create auth user and send magic link
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { full_name, role: user_role, org_name },
  });

  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });

  // Update profile with tier and org (trigger creates the row)
  await admin.from("profiles").update({ role, org_name }).eq("id", created.user.id);

  // Send magic link
  const { error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
