"use client";

import { useState, useMemo } from "react";
import { Heart, Pill, Brain, User, Baby, ClipboardCheck, Calendar, CheckCircle2 } from "lucide-react";
import { StepShell, HelpExpander, YesNoRadios } from "@/components/triage/step-shell";
import { ConditionPicker } from "@/components/triage/condition-picker";
import { BookingCalendar } from "@/components/triage/booking-calendar";
import { VerdictCard } from "@/components/triage/verdict-card";
import { findConditionById } from "@/lib/triage/conditions";
import {
  validateEmail,
  validateUKMobile,
  validatePostcode,
  validateAge,
  validateName,
} from "@/lib/triage/validation";
import type {
  StepId,
  PartialTriageAnswers,
  CalendarSlot,
  BookingChoice,
  TriageAnswers,
  Verdict,
} from "@/lib/triage/types";
import type { ClassifyConditionResponse } from "@/app/api/v1/triage/classify-condition/route";
import type { AssessResponse } from "@/app/api/v1/triage/assess/route";
import type { BookResponse } from "@/app/api/v1/triage/book/route";

// ─── Step ordering ─────────────────────────────────────────────────────────

/**
 * Visible-step calculator. Steps are skipped based on prior answers:
 *   - condition_detail:  shown only if the picked condition needs follow-up
 *   - female_specific:   shown only if gender is female (or prefer_not_say)
 *   - under_18:          shown only if age < 18
 *   - booking_slot:      shown only if user picked a preferred time
 */
function visibleSteps(answers: PartialTriageAnswers, bookingChoice: BookingChoice): StepId[] {
  const steps: StepId[] = ["condition"];

  // Condition detail step shown if the typeahead pick wants follow-up,
  // or if it's a free-text condition (always ask for more info).
  const cond = answers.condition;
  if (cond?.label) {
    const picked = cond.id ? findConditionById(cond.id) : undefined;
    if (!picked || picked.needsDetail === "more_info" || picked.needsDetail === "duration_only") {
      steps.push("condition_detail");
    }
  }

  steps.push("prior_treatments", "mental_health", "personal_details");

  if (
    answers.personalDetails?.gender === "female" ||
    answers.personalDetails?.gender === "prefer_not_say"
  ) {
    steps.push("female_specific");
  }

  if (
    typeof answers.personalDetails?.age === "number" &&
    answers.personalDetails.age < 18
  ) {
    steps.push("under_18");
  }

  steps.push("existing_patient_meds", "verdict", "booking_offer");

  if (bookingChoice === "preferred_time") {
    steps.push("booking_slot");
  }

  steps.push("confirmation");
  return steps;
}

// ─── Main component ─────────────────────────────────────────────────────────

export function TriageSection() {
  const [stepId, setStepId] = useState<StepId>("condition");
  const [answers, setAnswers] = useState<PartialTriageAnswers>({});
  const [bookingChoice, setBookingChoice] = useState<BookingChoice>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [consent, setConsent] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo(
    () => visibleSteps(answers, bookingChoice),
    [answers, bookingChoice],
  );
  const stepIndex = steps.indexOf(stepId);
  const stepNumber = stepIndex + 1;
  const totalSteps = steps.length;

  function patchAnswers(patch: Partial<PartialTriageAnswers>) {
    setAnswers((a) => ({ ...a, ...patch }));
  }
  function patchPersonal(patch: Partial<NonNullable<PartialTriageAnswers["personalDetails"]>>) {
    setAnswers((a) => ({
      ...a,
      personalDetails: { ...(a.personalDetails ?? {}), ...patch },
    }));
  }

  function goNext() {
    setError(null);
    const next = steps[stepIndex + 1];
    if (next) setStepId(next);
  }
  function goBack() {
    setError(null);
    const prev = steps[stepIndex - 1];
    if (prev) setStepId(prev);
  }

  async function classifyConditionAndAdvance() {
    const cond = answers.condition;
    if (!cond?.label) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/triage/classify-condition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: cond.label }),
      });
      if (!res.ok) throw new Error("Classifier failed");
      const data = (await res.json()) as ClassifyConditionResponse;
      patchAnswers({
        condition: {
          id: cond.id,
          label: cond.label,
          classification: data.classification,
          detail: cond.detail,
        },
      });
      goNext();
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the classifier. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  async function computeVerdictAndAdvance() {
    // Normalise: fill in defaults for steps that were skipped because they didn't apply.
    // (e.g. female_specific is skipped for male patients — their pregnancy status is "not_applicable".)
    const normalised: PartialTriageAnswers = {
      ...answers,
      pregnancyBreastfeeding: answers.pregnancyBreastfeeding ?? "not_applicable",
      under18Guardian: answers.under18Guardian ?? "not_applicable",
      currentMedications: answers.currentMedications ?? "",
    };

    if (!isAnswersComplete(normalised)) {
      setError("Some details are missing. Please use Back to complete them.");
      return;
    }
    setAnswers(normalised);
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/triage/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: normalised }),
      });
      if (!res.ok) throw new Error("Assessment failed");
      const data = (await res.json()) as AssessResponse;
      setVerdict(data.verdict);
      goNext();
    } catch (err) {
      console.error(err);
      setError("Couldn't compute the verdict. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitBookingAndAdvance() {
    if (!verdict || !isAnswersComplete(answers)) return;
    if (!consent) {
      setError("Please tick the consent box to continue.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/triage/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          verdict,
          preferredSlot: selectedSlot?.iso ?? null,
          preferredSlotLabel: selectedSlot?.label ?? null,
          consent,
        }),
      });
      if (!res.ok) throw new Error("Booking failed");
      const data = (await res.json()) as BookResponse;
      setBookingId(data.bookingId);
      goNext();
    } catch (err) {
      console.error(err);
      setError("Couldn't complete the booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function restart() {
    setStepId("condition");
    setAnswers({});
    setBookingChoice(null);
    setSelectedSlot(null);
    setConsent(false);
    setVerdict(null);
    setBookingId(null);
    setError(null);
  }

  // ─── Step rendering ───────────────────────────────────────────────────────

  const shellProps = { stepNumber, totalSteps, loading: isLoading };

  if (stepId === "condition") {
    const ready = (answers.condition?.label?.trim().length ?? 0) >= 2;
    return (
      <Wrapper error={error}>
        <StepShell
          {...shellProps}
          heading="What condition are you hoping to treat?"
          subheading="Start typing — we'll suggest matches, or you can describe it in your own words."
          onNext={classifyConditionAndAdvance}
          nextDisabled={!ready}
        >
          <ConditionPicker
            value={answers.condition ?? { label: "" }}
            onChange={(v) =>
              patchAnswers({
                condition: { ...v, classification: "unknown" },
              })
            }
          />
        </StepShell>
      </Wrapper>
    );
  }

  if (stepId === "condition_detail") {
    const cond = answers.condition;
    if (!cond) return null;
    const picked = cond.id ? findConditionById(cond.id) : undefined;
    const isDuration = picked?.needsDetail === "duration_only";
    const heading = isDuration
      ? "How long have you had this?"
      : "Could you tell us a bit more about your condition?";
    const subheading = isDuration
      ? "Approximate is fine — months or years."
      : "For example: how long, what kind, what helps or makes it worse.";
    return (
      <Wrapper error={error}>
        <StepShell
          {...shellProps}
          heading={heading}
          subheading={subheading}
          onNext={goNext}
          onBack={goBack}
          nextDisabled={(cond.detail?.trim().length ?? 0) < 2}
        >
          <textarea
            value={cond.detail ?? ""}
            onChange={(e) =>
              patchAnswers({ condition: { ...cond, detail: e.target.value } })
            }
            rows={3}
            placeholder={isDuration ? "e.g. 5 years" : "e.g. lower back pain for 8 years, worse in winter"}
            className="w-full px-3 py-2.5 border border-warm-200 rounded-lg text-sm text-cannavec-900 placeholder-warm-400 focus:outline-none focus:border-[#8a9a5a] focus:ring-1 focus:ring-[#8a9a5a] resize-none"
          />
        </StepShell>
      </Wrapper>
    );
  }

  if (stepId === "prior_treatments") {
    return <PriorTreatmentsStep
      answers={answers}
      patch={patchAnswers}
      onNext={goNext}
      onBack={goBack}
      shellProps={shellProps}
      error={error}
    />;
  }

  if (stepId === "mental_health") {
    return <MentalHealthStep
      answers={answers}
      patch={patchAnswers}
      onNext={goNext}
      onBack={goBack}
      shellProps={shellProps}
      error={error}
    />;
  }

  if (stepId === "personal_details") {
    return <PersonalDetailsStep
      answers={answers}
      patch={patchPersonal}
      onNext={goNext}
      onBack={goBack}
      shellProps={shellProps}
      error={error}
    />;
  }

  if (stepId === "female_specific") {
    return <FemaleSpecificStep
      answers={answers}
      patch={patchAnswers}
      onNext={goNext}
      onBack={goBack}
      shellProps={shellProps}
      error={error}
    />;
  }

  if (stepId === "under_18") {
    return <Under18Step
      answers={answers}
      patch={patchAnswers}
      onNext={goNext}
      onBack={goBack}
      shellProps={shellProps}
      error={error}
    />;
  }

  if (stepId === "existing_patient_meds") {
    return <ExistingPatientMedsStep
      answers={answers}
      patch={patchAnswers}
      onNext={computeVerdictAndAdvance}
      onBack={goBack}
      shellProps={shellProps}
      error={error}
    />;
  }

  if (stepId === "verdict") {
    if (!verdict) return null;
    const isRed = verdict.status === "red";
    return (
      <Wrapper error={error}>
        <StepShell
          {...shellProps}
          heading="Here's what we found"
          subheading="Based on your answers, here's our initial assessment. A clinician makes the final decision."
          onNext={goNext}
          onBack={goBack}
          nextLabel={isRed ? "Start again" : "Continue to booking"}
        >
          <VerdictCard verdict={verdict} />
          {verdict.flags.length > 0 && (
            <div className="mt-4 text-xs text-warm-500 leading-relaxed">
              The clinic will be made aware of {verdict.flags.length} factor{verdict.flags.length === 1 ? "" : "s"} requiring clinical judgement during your consultation.
            </div>
          )}
        </StepShell>
      </Wrapper>
    );
  }

  if (stepId === "booking_offer") {
    return (
      <Wrapper error={error}>
        <StepShell
          {...shellProps}
          heading="Do you have a preferred time?"
          subheading="The clinic is open Monday to Friday, 9am to 5pm. You can pick a slot now or have them call when they can."
          onNext={goNext}
          onBack={goBack}
          nextDisabled={bookingChoice === null}
        >
          <div className="space-y-3">
            <ChoiceTile
              icon={Calendar}
              title="Pick a preferred time"
              subtitle="Choose a slot from the clinic's diary"
              selected={bookingChoice === "preferred_time"}
              onClick={() => setBookingChoice("preferred_time")}
            />
            <ChoiceTile
              icon={ClipboardCheck}
              title="Any time — they can call when they can"
              subtitle="The clinic will reach out during business hours"
              selected={bookingChoice === "any_time"}
              onClick={() => {
                setBookingChoice("any_time");
                setSelectedSlot(null);
              }}
            />
          </div>
        </StepShell>
      </Wrapper>
    );
  }

  if (stepId === "booking_slot") {
    return (
      <Wrapper error={error}>
        <StepShell
          {...shellProps}
          heading="Pick a slot"
          subheading="30-minute slots, Monday to Friday, 9am to 5pm. Greyed-out times are taken."
          onNext={goNext}
          onBack={goBack}
          nextDisabled={!selectedSlot}
        >
          <BookingCalendar selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
        </StepShell>
      </Wrapper>
    );
  }

  if (stepId === "confirmation") {
    if (bookingId) {
      // Successfully booked
      return (
        <Wrapper error={null}>
          <ConfirmationCard
            name={answers.personalDetails?.name ?? "there"}
            email={answers.personalDetails?.email ?? ""}
            slot={selectedSlot}
            onRestart={restart}
          />
        </Wrapper>
      );
    }
    // Final consent + submit screen
    return (
      <Wrapper error={error}>
        <StepShell
          {...shellProps}
          heading="Almost done"
          subheading="One last thing — your consent for the clinic to contact you."
          onNext={submitBookingAndAdvance}
          onBack={goBack}
          nextLabel="Submit"
          nextDisabled={!consent}
        >
          <BookingSummary
            answers={answers}
            verdict={verdict}
            selectedSlot={selectedSlot}
            consent={consent}
            onConsentChange={setConsent}
          />
        </StepShell>
      </Wrapper>
    );
  }

  return null;
}

// ─── Wrapper ──────────────────────────────────────────────────────────────

function Wrapper({ children, error }: { children: React.ReactNode; error: string | null }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {children}
      {error && (
        <div className="mt-4 px-4 py-3 bg-[#fef2f2] border border-[#dc2626] rounded-lg text-sm text-[#dc2626]">
          {error}
        </div>
      )}
      <p className="mt-6 text-center text-xs text-warm-400">
        Not medical advice. Final eligibility is decided by a clinician during consultation.
      </p>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────

interface StepProps {
  answers: PartialTriageAnswers;
  patch: (patch: Partial<PartialTriageAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
  shellProps: { stepNumber: number; totalSteps: number; loading: boolean };
  error: string | null;
}

function PriorTreatmentsStep({ answers, patch, onNext, onBack, shellProps, error }: StepProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const value = answers.priorTreatments;
  const showFollowUp = value === "none";

  function handleChoice(v: "two_or_more" | "one" | "none") {
    patch({ priorTreatments: v });
  }
  function handleAfterPrompt(stillNo: boolean) {
    patch({ priorTreatments: stillNo ? "none_with_explanation" : "two_or_more" });
  }

  const ready = value && value !== "none";

  return (
    <Wrapper error={error}>
      <StepShell
        {...shellProps}
        heading="Have you tried other treatments for this condition?"
        subheading="Most clinics look for at least two prior treatments, but a single treatment may be enough in some cases."
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!ready}
      >
        <div className="space-y-3">
          <ChoiceTile
            icon={Pill}
            title="Yes — two or more"
            subtitle="Medications, therapy, or other treatments"
            selected={value === "two_or_more"}
            onClick={() => handleChoice("two_or_more")}
          />
          <ChoiceTile
            icon={Pill}
            title="Yes — one"
            subtitle="The clinician will assess whether one is enough"
            selected={value === "one"}
            onClick={() => handleChoice("one")}
          />
          <ChoiceTile
            icon={Pill}
            title="No — none yet"
            subtitle="We&apos;ll explain what counts as a previous treatment"
            selected={value === "none" || value === "none_with_explanation"}
            onClick={() => handleChoice("none")}
          />
        </div>

        {showFollowUp && (
          <div className="mt-4 px-4 py-4 bg-[#f5f7f0] border border-[#8a9a5a] rounded-lg">
            <p className="text-sm text-cannavec-900 mb-3 leading-relaxed">
              Treatments don&apos;t have to be medications. Physiotherapy, counselling, CBT, pain programmes, sleep clinics, dietary plans recommended by a clinician all count. Anything ring a bell?
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleAfterPrompt(false)}
                className="flex-1 px-4 py-2 text-sm rounded-md bg-[#8a9a5a] text-white hover:bg-[#7a8a4a]"
              >
                Yes, that&apos;s rung a bell
              </button>
              <button
                type="button"
                onClick={() => handleAfterPrompt(true)}
                className="flex-1 px-4 py-2 text-sm rounded-md bg-white text-warm-700 border border-warm-200 hover:border-warm-300"
              >
                Still no — let me continue
              </button>
            </div>
          </div>
        )}

        <HelpExpander
          label="Why are you asking this?"
          open={helpOpen}
          onToggle={() => setHelpOpen((o) => !o)}
        >
          UK guidance for private medical cannabis prescribing typically expects patients to have tried at least two other treatments first. This isn&apos;t a blanket rule — the clinician will weigh your full situation, but it&apos;s the standard starting point.
        </HelpExpander>
      </StepShell>
    </Wrapper>
  );
}

function MentalHealthStep({ answers, patch, onNext, onBack, shellProps, error }: StepProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const ready =
    typeof answers.personalPsychosisHistory === "boolean" &&
    typeof answers.familyPsychosisHistory === "boolean";

  return (
    <Wrapper error={error}>
      <StepShell
        {...shellProps}
        heading="A couple of mental-health questions"
        subheading="These help the clinician assess whether medical cannabis is safe for you."
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!ready}
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-cannavec-900 mb-2">
              Have <em>you personally</em> ever been diagnosed with psychosis, schizophrenia, or bipolar disorder?
            </p>
            <YesNoRadios
              value={answers.personalPsychosisHistory ?? null}
              onChange={(v) => patch({ personalPsychosisHistory: v })}
              name="Personal psychosis history"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-cannavec-900 mb-2">
              Has anyone in your <em>immediate family</em> (parent, sibling) been diagnosed with psychosis or schizophrenia?
            </p>
            <YesNoRadios
              value={answers.familyPsychosisHistory ?? null}
              onChange={(v) => patch({ familyPsychosisHistory: v })}
              name="Family psychosis history"
            />
            <p className="mt-2 text-xs text-warm-500">
              Family history alone doesn&apos;t mean you can&apos;t be prescribed — the clinician will take it into account.
            </p>
          </div>
        </div>

        <HelpExpander
          label="Why these two questions are separated"
          open={helpOpen}
          onToggle={() => setHelpOpen((o) => !o)}
        >
          A personal diagnosis of psychosis, schizophrenia, or bipolar disorder is a contraindication for medical cannabis. A family history isn&apos;t — it&apos;s a risk factor the clinician weighs alongside everything else.
        </HelpExpander>
      </StepShell>
    </Wrapper>
  );
}

function PersonalDetailsStep({
  answers,
  patch,
  onNext,
  onBack,
  shellProps,
  error,
}: {
  answers: PartialTriageAnswers;
  patch: (patch: Partial<NonNullable<PartialTriageAnswers["personalDetails"]>>) => void;
  onNext: () => void;
  onBack: () => void;
  shellProps: { stepNumber: number; totalSteps: number; loading: boolean };
  error: string | null;
}) {
  const p = answers.personalDetails ?? {};
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameRes = validateName(p.name ?? "");
  const emailRes = validateEmail(p.email ?? "");
  const phoneRes = validateUKMobile(p.phone ?? "");
  const ageRes = validateAge(p.age ?? "");
  const postcodeRes = validatePostcode(p.postcode ?? "");
  const genderOk = !!p.gender;

  const allValid =
    nameRes.ok && emailRes.ok && phoneRes.ok && ageRes.ok && postcodeRes.ok && genderOk;

  function field(
    label: string,
    name: string,
    input: React.ReactNode,
    err: string | undefined,
  ) {
    return (
      <div>
        <label className="block text-sm font-medium text-cannavec-900 mb-1.5">{label}</label>
        {input}
        {touched[name] && err && (
          <p className="mt-1 text-xs text-[#dc2626]">{err}</p>
        )}
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-warm-200 rounded-lg text-sm text-cannavec-900 placeholder-warm-400 focus:outline-none focus:border-[#8a9a5a] focus:ring-1 focus:ring-[#8a9a5a]";

  return (
    <Wrapper error={error}>
      <StepShell
        {...shellProps}
        heading="Tell us a little about yourself"
        subheading="So the clinic can get in touch. We only share these details with the clinic — see the privacy notice at the bottom."
        onNext={() => {
          setTouched({ name: true, email: true, phone: true, age: true, postcode: true, gender: true });
          if (allValid) onNext();
        }}
        onBack={onBack}
        nextDisabled={!allValid}
      >
        <form autoComplete="on" onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {field("Full name", "name",
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={p.name ?? ""}
              onChange={(e) => patch({ name: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              className={inputClass}
              placeholder="Jane Smith"
            />,
            nameRes.ok ? undefined : nameRes.error,
          )}
          {field("Email", "email",
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={p.email ?? ""}
              onChange={(e) => patch({ email: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={inputClass}
              placeholder="jane@example.com"
            />,
            emailRes.ok ? undefined : emailRes.error,
          )}
          {field("UK mobile", "phone",
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              value={p.phone ?? ""}
              onChange={(e) => patch({ phone: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              className={inputClass}
              placeholder="07712 345678"
            />,
            phoneRes.ok ? undefined : phoneRes.error,
          )}
          <div className="grid grid-cols-2 gap-4">
            {field("Age", "age",
              <input
                type="number"
                name="age"
                autoComplete="off"
                min={0}
                max={110}
                value={p.age ?? ""}
                onChange={(e) => patch({ age: e.target.value === "" ? undefined : Number(e.target.value) })}
                onBlur={() => setTouched((t) => ({ ...t, age: true }))}
                className={inputClass}
                placeholder="42"
              />,
              ageRes.ok ? undefined : ageRes.error,
            )}
            {field("Postcode", "postcode",
              <input
                type="text"
                name="postal-code"
                autoComplete="postal-code"
                value={p.postcode ?? ""}
                onChange={(e) => patch({ postcode: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, postcode: true }))}
                className={inputClass}
                placeholder="SW1A 1AA"
              />,
              postcodeRes.ok ? undefined : postcodeRes.error,
            )}
          </div>
          {field("Gender", "gender",
            <select
              value={p.gender ?? ""}
              onChange={(e) => patch({ gender: e.target.value as NonNullable<typeof p.gender> })}
              onBlur={() => setTouched((t) => ({ ...t, gender: true }))}
              className={inputClass}
            >
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>,
            genderOk ? undefined : "Please select an option.",
          )}
        </form>
      </StepShell>
    </Wrapper>
  );
}

function FemaleSpecificStep({ answers, patch, onNext, onBack, shellProps, error }: StepProps) {
  const value = answers.pregnancyBreastfeeding;
  const ready = !!value;
  return (
    <Wrapper error={error}>
      <StepShell
        {...shellProps}
        heading="One more question"
        subheading="Medical cannabis isn't prescribed during pregnancy, while planning a pregnancy, or while breastfeeding."
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!ready}
      >
        <div className="space-y-3">
          <ChoiceTile icon={Baby} title="None of these apply" subtitle="Not currently pregnant, planning, or breastfeeding" selected={value === "no"} onClick={() => patch({ pregnancyBreastfeeding: "no" })} />
          <ChoiceTile icon={Baby} title="Currently pregnant" selected={value === "pregnant"} onClick={() => patch({ pregnancyBreastfeeding: "pregnant" })} />
          <ChoiceTile icon={Baby} title="Planning a pregnancy in the next 6 months" selected={value === "planning_pregnancy"} onClick={() => patch({ pregnancyBreastfeeding: "planning_pregnancy" })} />
          <ChoiceTile icon={Baby} title="Currently breastfeeding" selected={value === "breastfeeding"} onClick={() => patch({ pregnancyBreastfeeding: "breastfeeding" })} />
        </div>
      </StepShell>
    </Wrapper>
  );
}

function Under18Step({ answers, patch, onNext, onBack, shellProps, error }: StepProps) {
  const value = answers.under18Guardian;
  const ready = value === "guardian_present" || value === "no_guardian";
  return (
    <Wrapper error={error}>
      <StepShell
        {...shellProps}
        heading="A note for under-18s"
        subheading="Most private clinics see adults only. The NHS prescribes for under-18s in specific cases — treatment-resistant epilepsy, MS spasticity, or chemotherapy-related nausea."
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!ready}
      >
        <p className="text-sm text-warm-700 mb-3 leading-relaxed">
          Will a parent or guardian be present for any consultation?
        </p>
        <YesNoRadios
          value={value === "guardian_present" ? true : value === "no_guardian" ? false : null}
          onChange={(v) => patch({ under18Guardian: v ? "guardian_present" : "no_guardian" })}
          name="Guardian present"
        />
      </StepShell>
    </Wrapper>
  );
}

function ExistingPatientMedsStep({ answers, patch, onNext, onBack, shellProps, error }: StepProps) {
  const ready = typeof answers.existingPatientElsewhere === "boolean";
  return (
    <Wrapper error={error}>
      <StepShell
        {...shellProps}
        heading="Just two more questions"
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!ready}
        nextLabel="See my result"
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-cannavec-900 mb-2">
              Are you currently a patient at another medical cannabis clinic?
            </p>
            <YesNoRadios
              value={answers.existingPatientElsewhere ?? null}
              onChange={(v) => patch({ existingPatientElsewhere: v })}
              name="Existing patient"
            />
            <p className="mt-2 text-xs text-warm-500">
              If yes, you&apos;ll need a discharge letter from your current clinic. We&apos;ll flag this for the team.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-cannavec-900 mb-2">
              Any prescription medications you&apos;re currently taking? <span className="font-normal text-warm-500">(Optional)</span>
            </label>
            <textarea
              value={answers.currentMedications ?? ""}
              onChange={(e) => patch({ currentMedications: e.target.value })}
              rows={3}
              placeholder="e.g. Sertraline 50mg, Naproxen as needed"
              className="w-full px-3 py-2.5 border border-warm-200 rounded-lg text-sm text-cannavec-900 placeholder-warm-400 focus:outline-none focus:border-[#8a9a5a] focus:ring-1 focus:ring-[#8a9a5a] resize-none"
            />
            <p className="mt-2 text-xs text-warm-500">
              The clinician needs to know about possible drug interactions.
            </p>
          </div>
        </div>
      </StepShell>
    </Wrapper>
  );
}

// ─── Helper components ────────────────────────────────────────────────────

function ChoiceTile({
  icon: Icon,
  title,
  subtitle,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors flex items-start gap-3 ${
        selected
          ? "border-[#8a9a5a] bg-[#f5f7f0]"
          : "border-warm-200 hover:border-warm-300"
      }`}
      aria-pressed={selected}
    >
      <Icon className={`w-5 h-5 mt-0.5 ${selected ? "text-[#8a9a5a]" : "text-warm-500"}`} />
      <div>
        <div className="text-sm font-medium text-cannavec-900">{title}</div>
        {subtitle && <div className="text-xs text-warm-500 mt-0.5">{subtitle}</div>}
      </div>
    </button>
  );
}

function BookingSummary({
  answers,
  verdict,
  selectedSlot,
  consent,
  onConsentChange,
}: {
  answers: PartialTriageAnswers;
  verdict: Verdict | null;
  selectedSlot: CalendarSlot | null;
  consent: boolean;
  onConsentChange: (v: boolean) => void;
}) {
  const p = answers.personalDetails;
  return (
    <div className="space-y-4">
      <div className="bg-warm-50 border border-warm-200 rounded-lg p-4 text-sm text-warm-700 space-y-2">
        <Row label="Name" value={p?.name} />
        <Row label="Email" value={p?.email} />
        <Row label="Mobile" value={p?.phone} />
        <Row label="Condition" value={answers.condition?.label} />
        <Row label="Outcome" value={verdict ? verdict.status.toUpperCase() : "—"} />
        <Row
          label="Preferred time"
          value={selectedSlot ? selectedSlot.label : "Any time during business hours"}
        />
      </div>

      <label className="flex items-start gap-3 px-4 py-3 border border-warm-200 rounded-lg cursor-pointer hover:bg-warm-50">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#8a9a5a]"
        />
        <span className="text-sm text-warm-700 leading-relaxed">
          I consent to my details being shared with the clinic for the purpose of contacting me. <span className="text-warm-500">Required.</span>
        </span>
      </label>

      <p className="text-xs text-warm-400">
        We only share your details with the clinic team. We don&apos;t use them for marketing, and we don&apos;t pass them to anyone else. See our{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-warm-700">
          Privacy Notice
        </a>{" "}
        for full details, including how to request deletion.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-warm-500">{label}</span>
      <span className="text-cannavec-900 text-right">{value || "—"}</span>
    </div>
  );
}

function ConfirmationCard({
  name,
  email,
  slot,
  onRestart,
}: {
  name: string;
  email: string;
  slot: CalendarSlot | null;
  onRestart: () => void;
}) {
  return (
    <div className="bg-white border border-warm-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#f5f7f0] flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-[#8a9a5a]" />
        </div>
        <h2 className="font-display text-2xl text-cannavec-900 mb-2">Thank you, {name.split(" ")[0]}</h2>
        <p className="text-sm text-warm-700 max-w-md mx-auto leading-relaxed">
          {slot ? (
            <>The clinic team will be in touch at your preferred time: <strong>{slot.label}</strong>. A confirmation will go to <strong>{email}</strong>.</>
          ) : (
            <>The clinic team will reach out as soon as they can during business hours (Mon-Fri, 9am to 5pm). A confirmation will go to <strong>{email}</strong>.</>
          )}
        </p>
      </div>
      <div className="px-6 py-4 bg-warm-50 border-t border-warm-200 flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm text-warm-600 hover:text-warm-900"
        >
          Start a new eligibility check
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function isAnswersComplete(a: PartialTriageAnswers): a is TriageAnswers {
  return (
    !!a.condition &&
    !!a.priorTreatments &&
    typeof a.personalPsychosisHistory === "boolean" &&
    typeof a.familyPsychosisHistory === "boolean" &&
    !!a.personalDetails &&
    !!a.personalDetails.name &&
    !!a.personalDetails.email &&
    !!a.personalDetails.phone &&
    typeof a.personalDetails.age === "number" &&
    !!a.personalDetails.gender &&
    !!a.personalDetails.postcode &&
    !!a.pregnancyBreastfeeding &&
    !!a.under18Guardian &&
    typeof a.existingPatientElsewhere === "boolean" &&
    typeof a.currentMedications === "string"
  );
}
