// Triage — Wizard Types
// ---------------------
// Shared TS types for the wizard state machine and step components.
// Pure types only — no runtime logic, no React imports.

import type {
  TriageAnswers,
  Verdict,
  Gender,
  PregnancyBreastfeedingStatus,
  Under18GuardianStatus,
  PriorTreatmentsStatus,
} from "./eligibility";

export type {
  TriageAnswers,
  Verdict,
  Gender,
  PregnancyBreastfeedingStatus,
  Under18GuardianStatus,
  PriorTreatmentsStatus,
};

/**
 * Wizard step IDs. Order matters — used for progress indicator and Next/Back navigation.
 *
 * Some steps are conditional and skipped at runtime by the orchestrator:
 *   - condition_detail:  skipped if condition has no follow-up
 *   - female_specific:   skipped if gender !== "female" (and possibly "prefer_not_say")
 *   - under_18:          skipped if age >= 18
 *   - booking_slot:      skipped if patient declines a preferred time
 */
export type StepId =
  | "condition"
  | "condition_detail"
  | "prior_treatments"
  | "mental_health"
  | "personal_details"
  | "female_specific"
  | "under_18"
  | "existing_patient_meds"
  | "verdict"
  | "booking_offer"
  | "booking_slot"
  | "confirmation";

/**
 * Partial answers — what we have so far during the wizard.
 * Becomes a full TriageAnswers when sent to /api/v1/triage/assess.
 */
export type PartialTriageAnswers = {
  condition?: TriageAnswers["condition"];
  priorTreatments?: PriorTreatmentsStatus;
  personalPsychosisHistory?: boolean;
  familyPsychosisHistory?: boolean;
  personalDetails?: Partial<TriageAnswers["personalDetails"]>;
  pregnancyBreastfeeding?: PregnancyBreastfeedingStatus;
  under18Guardian?: Under18GuardianStatus;
  existingPatientElsewhere?: boolean;
  currentMedications?: string;
};

export type BookingChoice = "any_time" | "preferred_time" | null;

/** A bookable slot. ISO datetime + display label. */
export interface CalendarSlot {
  /** ISO 8601 in UTC, e.g. "2026-05-19T10:00:00.000Z" */
  iso: string;
  /** Human-readable, e.g. "Mon 19 May, 10:00 AM" */
  label: string;
  /** Available? false if the slot is taken (T-3: from Google Calendar; T-2: fake). */
  available: boolean;
}

export interface WizardState {
  stepId: StepId;
  answers: PartialTriageAnswers;
  bookingChoice: BookingChoice;
  selectedSlot: CalendarSlot | null;
  consent: boolean;
  verdict: Verdict | null;
  bookingId: string | null;
  isLoading: boolean;
  error: string | null;
}
