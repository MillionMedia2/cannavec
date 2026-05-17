/**
 * Triage — Validation
 * --------------------
 * Light-touch validators for the eligibility form. All silent — no exceptions thrown;
 * each returns a discriminated union with success/failure so the caller can render
 * inline errors without try/catch boilerplate.
 *
 * These validate FORMAT only. We are not verifying that an email is deliverable,
 * a postcode exists, or a phone number is reachable — that's a clinic-side problem.
 *
 * Reference: knowledge/cannabis/projects/Triage Agent/architecture.md § 3 Step 5
 */

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

// ────────────────────────────────────────────────────────────────────────────
// Email
// ────────────────────────────────────────────────────────────────────────────

/**
 * Email format check. Pragmatic regex — accepts most real-world addresses,
 * rejects obvious nonsense. Not RFC-5322 perfect (which is impossible in a regex).
 */
export function validateEmail(input: string): ValidationResult<string> {
  const v = input.trim().toLowerCase();
  if (!v) return { ok: false, error: "Email is required." };
  if (v.length > 254) return { ok: false, error: "Email is too long." };

  // Basic shape: local@domain.tld
  // - local: one+ chars, common symbols allowed
  // - domain: one+ chars + dot + 2+ tld chars
  const re = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
  if (!re.test(v)) return { ok: false, error: "Please enter a valid email address." };

  // No consecutive dots, no leading/trailing dots in local part
  const [local] = v.split("@");
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  return { ok: true, value: v };
}

// ────────────────────────────────────────────────────────────────────────────
// UK Mobile
// ────────────────────────────────────────────────────────────────────────────

/**
 * UK mobile validation. Accepts the common formats users actually enter:
 *   07712 345678
 *   07712345678
 *   +44 7712 345678
 *   +447712345678
 *   00447712345678   (international dial prefix)
 *
 * Normalises all of the above to the canonical "07XXX XXXXXX" national form.
 *
 * UK mobile numbers all begin with 07 in national form, followed by 9 more digits.
 * The number after "07" is in 074, 075, 077, 078, 079 ranges (07624 is Isle of Man).
 * We don't enforce the prefix range — clinics will catch genuine errors at call time.
 */
export function validateUKMobile(input: string): ValidationResult<string> {
  if (!input || !input.trim()) {
    return { ok: false, error: "Phone number is required." };
  }

  // Strip everything that isn't a digit or leading +
  const cleaned = input.replace(/[\s\-()]/g, "");

  // Strict format check — must look like a phone number
  if (!/^\+?\d+$/.test(cleaned)) {
    return { ok: false, error: "Please enter a valid UK mobile number." };
  }

  // Normalise to national 07XXXXXXXXX
  let national: string;
  if (cleaned.startsWith("+44")) {
    national = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("0044")) {
    national = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("44") && cleaned.length === 12) {
    // Tolerant: "447712..." (no plus, no leading zero)
    national = "0" + cleaned.slice(2);
  } else {
    national = cleaned;
  }

  // Must now be exactly 11 digits starting with 07
  if (national.length !== 11) {
    return { ok: false, error: "UK mobile numbers should have 11 digits (e.g. 07712 345678)." };
  }
  if (!national.startsWith("07")) {
    return { ok: false, error: "This doesn't look like a UK mobile number — they start with 07." };
  }

  // Display-formatted: "07712 345678"
  const formatted = `${national.slice(0, 5)} ${national.slice(5)}`;
  return { ok: true, value: formatted };
}

// ────────────────────────────────────────────────────────────────────────────
// UK Postcode
// ────────────────────────────────────────────────────────────────────────────

/**
 * UK postcode format check. Doesn't verify the postcode exists.
 * Accepts and normalises to standard "OUTCODE INCODE" format (e.g. "SW1A 1AA").
 *
 * Pattern reference: GOV.UK Bulk Data Transfer specification.
 */
export function validatePostcode(input: string): ValidationResult<string> {
  const v = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!v) return { ok: false, error: "Postcode is required." };

  // Standard UK postcode regex
  // Outward: 1-2 letters, 1 digit, optional letter/digit (e.g. SW1A, M1, B33, CR2)
  // Inward:  1 digit, 2 letters (e.g. 1AA)
  const re = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/;
  const match = v.match(re);
  if (!match) return { ok: false, error: "Please enter a valid UK postcode (e.g. SW1A 1AA)." };

  // Re-space: "OUTCODE INCODE"
  return { ok: true, value: `${match[1]} ${match[2]}` };
}

// ────────────────────────────────────────────────────────────────────────────
// Age
// ────────────────────────────────────────────────────────────────────────────

/**
 * Age validation. Accepts a number or numeric string. Range 0–110.
 * The under-18 path is handled by the verdict engine, not rejected here —
 * we only reject impossible ages.
 */
export function validateAge(input: number | string): ValidationResult<number> {
  if (input === "" || input === null || input === undefined) {
    return { ok: false, error: "Age is required." };
  }

  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n)) return { ok: false, error: "Please enter a valid age." };
  if (!Number.isInteger(n)) return { ok: false, error: "Age must be a whole number." };
  if (n < 0 || n > 110) return { ok: false, error: "Please enter a valid age between 0 and 110." };

  return { ok: true, value: n };
}

// ────────────────────────────────────────────────────────────────────────────
// Name
// ────────────────────────────────────────────────────────────────────────────

/**
 * Name validation. Permissive on characters (apostrophes, hyphens, spaces, accents)
 * because real names are diverse. Rejects only the obvious — empty, too short,
 * digits, control characters.
 */
export function validateName(input: string): ValidationResult<string> {
  const v = input.trim().replace(/\s+/g, " ");
  if (!v) return { ok: false, error: "Name is required." };
  if (v.length < 2) return { ok: false, error: "Please enter your full name." };
  if (v.length > 100) return { ok: false, error: "Name is too long." };
  if (/\d/.test(v)) return { ok: false, error: "Names shouldn't contain numbers." };
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F]/.test(v)) return { ok: false, error: "Please enter a valid name." };
  return { ok: true, value: v };
}
