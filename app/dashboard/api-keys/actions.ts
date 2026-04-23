"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApiKey } from "@/lib/api-keys";
import { revalidatePath } from "next/cache";

export async function createKeyAction(
  name: string
): Promise<{ plaintext: string } | { error: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const { plaintext, hash, prefix } = generateApiKey();
  const admin = createAdminClient();

  const { error } = await admin.from("api_keys").insert({
    user_id: user.id,
    key_hash: hash,
    key_prefix: prefix,
    name,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
  return { plaintext };
}

export async function revokeKeyAction(
  id: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
  return {};
}
