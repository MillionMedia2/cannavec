// Triage — Airtable Client
// -------------------------
// Replaces lib/triage/calendar.ts (Google Calendar, abandoned due to Workspace
// permission restrictions — see tracker.md issue #6).
//
// Writes a triage submission as a new record in the Appointments table
// (tbllSMC9UgQPUHtKz) inside the Clinics base (appFYYoOnimtB1uZe).
//
// Uses the standard Airtable REST API with the existing AIRTABLE_API_KEY.
// No extra dependencies — the project already calls Airtable elsewhere.
//
// Field mapping:
//   Name                    ← answers.personalDetails.name
//   Email                   ← answers.personalDetails.email
//   Mobile                  ← answers.personalDetails.phone
//   Age                     ← answers.personalDetails.age
//   Gender                  ← answers.personalDetails.gender
//   Postcode                ← answers.personalDetails.postcode
//   Condition               ← answers.condition.label
//   Condition Detail        ← answers.condition.detail
//   Condition Classification ← answers.condition.classification
//   Prior Treatments        ← answers.priorTreatments
//   Personal Psychosis History ← answers.personalPsychosisHistory
//   Family Psychosis History   ← answers.familyPsychosisHistory
//   Pregnancy Status        ← answers.pregnancyBreastfeeding
//   Existing Patient Elsewhere ← answers.existingPatientElsewhere
//   Current Medications     ← answers.currentMedications
//   Verdict                 ← verdict.status (formatted)
//   Clinic Flags            ← verdict.flags joined
//   Preferred Slot          ← preferredSlot label or "Any time"
//   GDPR Consent            ← true (always — endpoint rejects if false)
//   Submitted At            ← now (ISO 8601)
//   Notes                   ← verdict reasons joined (for clinic context)
//   Status                  ← "Todo" (clinic picks this up as a new submission)
//
// Reference: knowledge/cannabis/projects/Triage Agent/architecture.md

import type { TriageAnswers, Verdict } from "./eligibility";
import { formatFlagsForClinic } from "./eligibility";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE_ID = "appFYYoOnimtB1uZe";
const TABLE_ID = "tbllSMC9UgQPUHtKz";

export interface CreateTriageRecordInput {
  answers: TriageAnswers;
  verdict: Verdict;
  /** Human-readable slot label e.g. "Mon 19 May, 10:00 AM", or null for any time. */
  preferredSlotLabel: string | null;
}

export interface CreateTriageRecordResult {
  recordId: string;
  airtableUrl: string;
}

export async function createTriageRecord(
  input: CreateTriageRecordInput,
): Promise<CreateTriageRecordResult> {
  const { answers, verdict, preferredSlotLabel } = input;
  const p = answers.personalDetails;

  // Map verdict status to the Airtable select option name
  const verdictLabel =
    verdict.status === "green" ? "Green — Likely eligible" :
    verdict.status === "amber" ? "Amber — Assessment needed" :
    "Red — Not currently suitable";

  // Map prior treatments to Airtable option name
  const priorTreatmentsLabel =
    answers.priorTreatments === "two_or_more" ? "Two or more" :
    answers.priorTreatments === "one" ? "One" :
    answers.priorTreatments === "none_with_explanation" ? "None (after prompt)" :
    "None";

  // Map pregnancy status to Airtable option name
  const pregnancyLabel =
    answers.pregnancyBreastfeeding === "not_applicable" ? "Not applicable" :
    answers.pregnancyBreastfeeding === "no" ? "No" :
    answers.pregnancyBreastfeeding === "pregnant" ? "Pregnant" :
    answers.pregnancyBreastfeeding === "planning_pregnancy" ? "Planning pregnancy" :
    "Breastfeeding";

  // Map gender to Airtable option name
  const genderLabel =
    p.gender === "female" ? "Female" :
    p.gender === "male" ? "Male" :
    p.gender === "non_binary" ? "Non-binary" :
    "Prefer not to say";

  // Map condition classification to Airtable option name
  const classificationLabel = answers.condition.classification;

  // Clinic flags as numbered list — blank string if none
  const flagsText = verdict.flags.length > 0 ? formatFlagsForClinic(verdict) : "";

  // Reasons joined as the Notes field — gives the clinician the plain-English summary
  const notesText = verdict.reasons.length > 0
    ? verdict.reasons.join("\n\n")
    : "";

  const fields: Record<string, unknown> = {
    "Name": p.name,
    "Email": p.email,
    "Mobile": p.phone,
    "Age": p.age,
    "Gender": genderLabel,
    "Postcode": p.postcode,
    "Condition": answers.condition.label,
    "Condition Classification": classificationLabel,
    "Prior Treatments": priorTreatmentsLabel,
    "Personal Psychosis History": answers.personalPsychosisHistory,
    "Family Psychosis History": answers.familyPsychosisHistory,
    "Pregnancy Status": pregnancyLabel,
    "Existing Patient Elsewhere": answers.existingPatientElsewhere,
    "Verdict": verdictLabel,
    "GDPR Consent": true,
    "Submitted At": new Date().toISOString(),
    "Status": "Todo",
  };

  // Optional fields — only write if non-empty
  if (answers.condition.detail?.trim()) {
    fields["Condition Detail"] = answers.condition.detail.trim();
  }
  if (answers.currentMedications?.trim()) {
    fields["Current Medications"] = answers.currentMedications.trim();
  }
  if (flagsText) {
    fields["Clinic Flags"] = flagsText;
  }
  if (notesText) {
    fields["Notes"] = notesText;
  }
  fields["Preferred Slot"] = preferredSlotLabel ?? "Any time — call when available";

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Airtable API error ${res.status}: ${errorText}`);
  }

  const data = await res.json() as { id: string };
  const recordId = data.id;

  return {
    recordId,
    airtableUrl: `https://airtable.com/${BASE_ID}/${TABLE_ID}/${recordId}`,
  };
}
