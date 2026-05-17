/**
 * Triage — Eligibility Verdict Engine
 * ------------------------------------
 * Pure function over the patient's collected answers → green / amber / red verdict.
 *
 * Verdict semantics (locked 2026-05-15):
 *   - GREEN  → Likely eligible. Proceed to booking.
 *   - AMBER  → Clinician assessment needed. Booking still proceeds; flags passed to clinic.
 *   - RED    → Not currently suitable. Booking blocked; signpost shown.
 *
 * KEY PRINCIPLE: Amber NEVER blocks booking. Only red does.
 * This mirrors the KB: family psychosis history, sparse medical records, "no" to
 * prior treatments — these are clinical-judgement matters, not eligibility blockers.
 *
 * Reference:
 *   - architecture.md § 2 ("Eligibility Logic — Source of Truth")
 *   - knowledge/cannabis/mc-knowledge-base/cannabis-faq/eligibility_and_medical_records/
 *   - knowledge/cannabis/mc-knowledge-base/cannabis/9. Regulation, Law & Compliance/9.1 Jurisdictional Frameworks/uk_legal_context.md
 */

// ────────────────────────────────────────────────────────────────────────────
// Input — TriageAnswers
// ────────────────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "non_binary" | "prefer_not_say";

export type PregnancyBreastfeedingStatus =
  | "not_applicable"
  | "no"
  | "pregnant"
  | "planning_pregnancy"
  | "breastfeeding";

export type Under18GuardianStatus =
  | "not_applicable"  // 18+
  | "guardian_present"
  | "no_guardian";

export type PriorTreatmentsStatus =
  | "two_or_more"
  | "one"
  | "none_with_explanation"  // user understood non-drug counts, still no
  | "none";                  // initial answer, may upgrade after prompt

export interface TriageAnswers {
  // Step 1 + 2
  condition: {
    /** Condition ID from TRIAGE_CONDITIONS if picked from typeahead, otherwise undefined. */
    id?: string;
    /** What the user typed/selected (always present, used for free-text fallback). */
    label: string;
    /**
     * Classifier result from /api/chatbot — was the condition recognised as treatable?
     * Set by classify-condition API route. In unit tests we pass it directly.
     */
    classification: "treatable" | "contraindicated" | "unknown";
    /** Optional follow-up detail (duration / additional info). */
    detail?: string;
  };

  // Step 3
  priorTreatments: PriorTreatmentsStatus;

  // Step 4
  personalPsychosisHistory: boolean;   // user themselves diagnosed with psychosis/schizophrenia/bipolar
  familyPsychosisHistory: boolean;     // immediate family — risk factor, not blocker

  // Step 5 (validated separately by validation.ts before reaching the verdict engine)
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: Gender;
    postcode: string;
  };

  // Step 6
  pregnancyBreastfeeding: PregnancyBreastfeedingStatus;
  under18Guardian: Under18GuardianStatus;

  // Step 7
  existingPatientElsewhere: boolean;
  currentMedications: string;  // free text, never gates a verdict on its own
}

// ────────────────────────────────────────────────────────────────────────────
// Output — Verdict
// ────────────────────────────────────────────────────────────────────────────

export type VerdictStatus = "green" | "amber" | "red";

export type Signpost =
  | { kind: "mental_health"; message: string }
  | { kind: "gp_referral"; message: string }
  | { kind: "nhs_specialist"; message: string }
  | { kind: "addiction_services"; message: string }
  | { kind: "pregnancy_clinician"; message: string };

export interface Verdict {
  status: VerdictStatus;
  /** Patient-readable reasons for the verdict. */
  reasons: string[];
  /**
   * Flags passed to the clinic in the calendar event description.
   * AMBER verdicts may have several; GREEN typically has none; RED uses signposts instead.
   */
  flags: string[];
  /** Only set when status === "red". */
  signpost?: Signpost;
}

// ────────────────────────────────────────────────────────────────────────────
// Verdict engine
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pure function. Given the patient's answers, return the verdict.
 *
 * Evaluation order matters: RED triggers are checked first (any one is sufficient),
 * then AMBER flags accumulate, otherwise GREEN.
 */
export function assessEligibility(answers: TriageAnswers): Verdict {
  // ── RED gates ────────────────────────────────────────────────────────────

  // Contraindicated condition (schizophrenia, psychosis, bipolar mania, CUD, CHS, pregnancy-related)
  if (answers.condition.classification === "contraindicated") {
    return {
      status: "red",
      reasons: [
        `Medical cannabis isn't a suitable treatment for the condition described.`,
      ],
      flags: [],
      signpost: {
        kind: "gp_referral",
        message:
          "Please speak with your GP about your condition. They can refer you to the most appropriate specialist services.",
      },
    };
  }

  // Personal history of psychosis / schizophrenia / bipolar — hard contraindication
  if (answers.personalPsychosisHistory) {
    return {
      status: "red",
      reasons: [
        "A personal diagnosis of psychosis, schizophrenia, or bipolar disorder means medical cannabis is not currently a safe option.",
      ],
      flags: [],
      signpost: {
        kind: "mental_health",
        message:
          "Please continue working with your mental health team or GP. If you're in crisis, call 111 (option 2) or Samaritans on 116 123.",
      },
    };
  }

  // Pregnancy / planning pregnancy / breastfeeding — hard contraindication per UK guidance
  if (
    answers.pregnancyBreastfeeding === "pregnant" ||
    answers.pregnancyBreastfeeding === "planning_pregnancy" ||
    answers.pregnancyBreastfeeding === "breastfeeding"
  ) {
    const which =
      answers.pregnancyBreastfeeding === "pregnant"
        ? "pregnant"
        : answers.pregnancyBreastfeeding === "planning_pregnancy"
          ? "planning a pregnancy"
          : "breastfeeding";
    return {
      status: "red",
      reasons: [
        `Medical cannabis isn't prescribed when someone is ${which}, because cannabinoids can pass to the baby.`,
      ],
      flags: [],
      signpost: {
        kind: "pregnancy_clinician",
        message:
          "Please speak with your GP, midwife, or obstetrician about safe options during this period.",
      },
    };
  }

  // Under 18 without a guardian and without a qualifying NHS condition
  if (answers.personalDetails.age < 18) {
    if (answers.under18Guardian === "no_guardian") {
      return {
        status: "red",
        reasons: [
          "Patients under 18 must be accompanied by a parent or guardian for any consultation.",
        ],
        flags: [],
        signpost: {
          kind: "gp_referral",
          message:
            "Please involve a parent or guardian before booking. They can complete this eligibility check with you.",
        },
      };
    }
    // Under 18 + guardian present → amber path below
  }

  // ── AMBER flags (accumulate; don't block booking) ────────────────────────

  const flags: string[] = [];
  const reasons: string[] = [];

  // Unrecognised / unclear condition — clinician needs to assess fit
  if (answers.condition.classification === "unknown") {
    flags.push(
      `Condition "${answers.condition.label}" was not recognised against the medical cannabis condition list — clinician to assess fit.`,
    );
    reasons.push(
      "Your condition will need a clinician to assess whether medical cannabis is a suitable treatment option.",
    );
  }

  // Family-only psychosis history (KB: this is a risk factor, not a disqualifier)
  if (answers.familyPsychosisHistory) {
    flags.push(
      "Family history of psychosis/schizophrenia — clinician to weigh risk during consultation.",
    );
    reasons.push(
      "Family history of psychosis is taken into account by the clinician but doesn't automatically mean you can't be prescribed.",
    );
  }

  // Prior treatments — no, even after the "non-drug counts" prompt
  if (answers.priorTreatments === "none_with_explanation") {
    flags.push(
      "Patient reports no prior treatments tried, even after non-drug options explained — clinician to assess whether the two-prior-treatment standard can be met.",
    );
    reasons.push(
      "Without two prior treatments, eligibility depends on the clinician's assessment. You may still be suitable depending on your situation.",
    );
  } else if (answers.priorTreatments === "one") {
    flags.push("Patient reports one prior treatment (standard is two).");
    reasons.push(
      "Most clinics look for two prior treatments. The clinician will assess whether one is enough in your case.",
    );
  } else if (answers.priorTreatments === "none") {
    // Should not normally reach here — the UI is supposed to re-prompt after "none".
    // If it does (e.g. via API directly), flag it.
    flags.push("Patient reports no prior treatments tried — clinician to assess.");
    reasons.push(
      "Without prior treatments tried, eligibility depends on the clinician's assessment.",
    );
  }

  // Under 18 with a guardian (treatment-resistant epilepsy, MS spasticity, CINV are the realistic NHS paths)
  if (answers.personalDetails.age < 18 && answers.under18Guardian === "guardian_present") {
    flags.push(
      `Under-18 patient (age ${answers.personalDetails.age}). NHS prescribes for under-18s only in specific cases (treatment-resistant epilepsy, MS spasticity, CINV). Private clinic to assess whether to accept.`,
    );
    reasons.push(
      "Patients under 18 are seen only in specific circumstances. The clinician will assess whether your condition qualifies.",
    );
  }

  // Existing patient elsewhere → discharge letter needed
  if (answers.existingPatientElsewhere) {
    flags.push(
      "Patient is currently registered at another medical cannabis clinic — discharge letter will be required.",
    );
  }

  // Concurrent medications — pass through to clinician (the eligibility verdict doesn't gate on this)
  if (answers.currentMedications && answers.currentMedications.trim().length > 0) {
    flags.push(`Current medications declared: ${answers.currentMedications.trim()}`);
  }

  // ── Final verdict ────────────────────────────────────────────────────────

  if (flags.length === 0) {
    return {
      status: "green",
      reasons: [
        "Based on your answers, you look likely to meet the standard eligibility criteria for a private medical cannabis prescription in the UK.",
        "A clinician will still need to make the final decision during your consultation.",
      ],
      flags: [],
    };
  }

  return {
    status: "amber",
    reasons,
    flags,
  };
}

/** Convenience for stringifying flags into the calendar event description. */
export function formatFlagsForClinic(verdict: Verdict): string {
  if (verdict.flags.length === 0) return "(no flags)";
  return verdict.flags.map((f, i) => `${i + 1}. ${f}`).join("\n");
}

/** Patient-readable headline for the verdict card. */
export function verdictHeadline(status: VerdictStatus): string {
  switch (status) {
    case "green":
      return "You look likely to be eligible";
    case "amber":
      return "You may be eligible — a clinician needs to confirm";
    case "red":
      return "Medical cannabis doesn't look right for you at the moment";
  }
}
