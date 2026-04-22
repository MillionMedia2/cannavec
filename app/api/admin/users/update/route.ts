import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: caller } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!caller?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
