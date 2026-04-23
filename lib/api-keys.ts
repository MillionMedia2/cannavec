import crypto from "crypto";
import { createAdminClient } from "./supabase/admin";

export function generateApiKey(): { plaintext: string; hash: string; prefix: string } {
  const randomHex = crypto.randomBytes(16).toString("hex"); // 32 hex chars
  const plaintext = `ck_live_${randomHex}`;
  const hash = hashApiKey(plaintext);
  const prefix = `ck_live_${randomHex.slice(0, 8)}…`;
  return { plaintext, hash, prefix };
}

export function hashApiKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}

export async function verifyApiKey(plaintext: string): Promise<{
  valid: boolean;
  user_id?: string;
  tier?: string;
  key_id?: string;
  error?: string;
}> {
  try {
    const hash = hashApiKey(plaintext);
    const admin = createAdminClient();

    const { data: key, error: keyError } = await admin
      .from("api_keys")
      .select("id, user_id")
      .eq("key_hash", hash)
      .eq("is_active", true)
      .single();

    if (keyError || !key) {
      return { valid: false, error: "Invalid API key" };
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", key.user_id)
      .single();

    if (profileError || !profile) {
      return { valid: false, error: "User profile not found" };
    }

    return {
      valid: true,
      user_id: key.user_id,
      tier: profile.role ?? "free",
      key_id: key.id,
    };
  } catch (err) {
    return { valid: false, error: "Key verification failed" };
  }
}
