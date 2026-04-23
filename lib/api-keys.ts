import crypto from "crypto";

export function generateApiKey(): { plaintext: string; hash: string; prefix: string } {
  const randomHex = crypto.randomBytes(16).toString("hex"); // 32 hex chars
  const plaintext = `ck_live_${randomHex}`;
  const hash = hashApiKey(plaintext);
  // prefix: "ck_live_" + first 8 chars of the random part (safe to display)
  const prefix = `ck_live_${randomHex.slice(0, 8)}…`;
  return { plaintext, hash, prefix };
}

export function hashApiKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}
