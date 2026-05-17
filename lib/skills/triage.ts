// Triage Skill Registry Entry
// ----------------------------
// The Triage Skill ("Free Eligibility Check") is a multi-step UI wizard, NOT
// a callable API skill. It lives at /dashboard/skills/triage and is also
// embeddable via iframe at /triage.
//
// This registry entry exists so that:
//   1. The skill appears in the dashboard catalogue tile array
//   2. Tier-checking works consistently
//   3. If anyone tries to invoke it via the MCP endpoint or /api/v1/skills,
//      the handler returns a clear redirect message rather than failing silently
//
// mcpEligible: false  →  Claude Desktop / Cursor will NOT see this as a tool
// minTier: "free"     →  available to all registered Cannavec users
//
// The actual implementation lives in:
//   - lib/triage/*           (pure logic + Airtable client)
//   - components/triage-section.tsx + components/triage/* (UI)
//   - app/api/v1/triage/*    (classify-condition, assess, book)
//   - app/dashboard/skills/triage/page.tsx  (dashboard surface)
//   - app/triage/page.tsx    (iframe-embeddable surface)

import { Skill } from "./types";

export const triage: Skill = {
  id: "triage",
  name: "Free Eligibility Check",
  description:
    "A patient-facing triage workflow for UK medical cannabis. Answers a few questions, produces an evidence-grounded verdict, and books a clinic call. This is a UI wizard, not an API skill — use it at /dashboard/skills/triage or embed via iframe at /triage.",
  minTier: "free",
  mcpEligible: false, // Multi-step UI wizard, not a callable tool. See header comment.
  annotations: {
    readOnlyHint: false,    // it writes to Airtable when patient submits
    destructiveHint: false,  // never deletes anything
    openWorldHint: true,     // hits external service (Airtable)
  },
  // No input schema — this is a UI wizard, not a tool the LLM calls directly.
  // Defined as empty object so any accidental invocation fails the JSON schema check cleanly.
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  async handler() {
    return {
      text:
        "The Free Eligibility Check is a multi-step UI wizard, not a callable skill. " +
        "Open https://cannavec.ai/dashboard/skills/triage to use it, or embed it on " +
        "your site via iframe at https://cannavec.ai/triage.",
      structuredContent: {
        ui_only: true,
        surface_dashboard: "/dashboard/skills/triage",
        surface_iframe: "/triage",
        surface_marketing: "/skills/triage",
      },
    };
  },
};
