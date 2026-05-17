/**
 * Smoke test for Triage eligibility logic (T-1).
 * Run: npx tsx scripts/test-triage-eligibility.ts
 *
 * Exercises every branch of assessEligibility(), plus a sampling of
 * conditions search and validation. No assertion library — output is
 * inspected by eye.
 */

import {
  assessEligibility,
  formatFlagsForClinic,
  TriageAnswers,
  verdictHeadline,
} from "../lib/triage/eligibility";
import {
  searchTriageConditions,
  findConditionById,
  isExcludedCondition,
} from "../lib/triage/conditions";
import {
  validateEmail,
  validateUKMobile,
  validatePostcode,
  validateAge,
  validateName,
} from "../lib/triage/validation";

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function baseAnswers(): TriageAnswers {
  return {
    condition: {
      id: "chronic_pain",
      label: "Chronic pain",
      classification: "treatable",
      detail: "5 years",
    },
    priorTreatments: "two_or_more",
    personalPsychosisHistory: false,
    familyPsychosisHistory: false,
    personalDetails: {
      name: "Test Patient",
      email: "test@example.com",
      phone: "07712 345678",
      age: 42,
      gender: "male",
      postcode: "SW1A 1AA",
    },
    pregnancyBreastfeeding: "not_applicable",
    under18Guardian: "not_applicable",
    existingPatientElsewhere: false,
    currentMedications: "",
  };
}

function section(name: string) {
  console.log("\n" + "═".repeat(72));
  console.log("  " + name);
  console.log("═".repeat(72));
}

function printVerdict(label: string, ans: TriageAnswers) {
  const v = assessEligibility(ans);
  const color = v.status === "green" ? "🟢" : v.status === "amber" ? "🟡" : "🔴";
  console.log(`\n${color} [${v.status.toUpperCase()}] ${label}`);
  console.log(`  Headline: ${verdictHeadline(v.status)}`);
  if (v.reasons.length) {
    console.log(`  Reasons:`);
    v.reasons.forEach((r) => console.log(`    - ${r}`));
  }
  if (v.flags.length) {
    console.log(`  Clinic flags:`);
    v.flags.forEach((f) => console.log(`    • ${f}`));
  }
  if (v.signpost) {
    console.log(`  Signpost (${v.signpost.kind}): ${v.signpost.message}`);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 1. Verdict — happy path
// ───────────────────────────────────────────────────────────────────────────

section("VERDICT — Green (happy path)");
printVerdict("Treatable condition, all clear", baseAnswers());

// ───────────────────────────────────────────────────────────────────────────
// 2. Verdict — every RED trigger
// ───────────────────────────────────────────────────────────────────────────

section("VERDICT — Red triggers");

const contraindicatedAns = baseAnswers();
contraindicatedAns.condition.classification = "contraindicated";
contraindicatedAns.condition.label = "Schizophrenia";
printVerdict("Contraindicated condition", contraindicatedAns);

const personalPsychAns = baseAnswers();
personalPsychAns.personalPsychosisHistory = true;
printVerdict("Personal psychosis history", personalPsychAns);

const pregnantAns = baseAnswers();
pregnantAns.personalDetails.gender = "female";
pregnantAns.pregnancyBreastfeeding = "pregnant";
printVerdict("Pregnant", pregnantAns);

const planningPregAns = baseAnswers();
planningPregAns.personalDetails.gender = "female";
planningPregAns.pregnancyBreastfeeding = "planning_pregnancy";
printVerdict("Planning pregnancy", planningPregAns);

const breastfeedingAns = baseAnswers();
breastfeedingAns.personalDetails.gender = "female";
breastfeedingAns.pregnancyBreastfeeding = "breastfeeding";
printVerdict("Breastfeeding", breastfeedingAns);

const minorNoGuardianAns = baseAnswers();
minorNoGuardianAns.personalDetails.age = 16;
minorNoGuardianAns.under18Guardian = "no_guardian";
printVerdict("Under 18, no guardian", minorNoGuardianAns);

// ───────────────────────────────────────────────────────────────────────────
// 3. Verdict — every AMBER flag
// ───────────────────────────────────────────────────────────────────────────

section("VERDICT — Amber flags");

const unknownConditionAns = baseAnswers();
unknownConditionAns.condition.classification = "unknown";
unknownConditionAns.condition.label = "Some rare clinical thing";
printVerdict("Unknown / unclassified condition", unknownConditionAns);

const familyPsychAns = baseAnswers();
familyPsychAns.familyPsychosisHistory = true;
printVerdict("Family psychosis history only", familyPsychAns);

const noPriorTxExplainedAns = baseAnswers();
noPriorTxExplainedAns.priorTreatments = "none_with_explanation";
printVerdict("No prior treatments (after non-drug prompt)", noPriorTxExplainedAns);

const onePriorTxAns = baseAnswers();
onePriorTxAns.priorTreatments = "one";
printVerdict("Only one prior treatment", onePriorTxAns);

const minorGuardianAns = baseAnswers();
minorGuardianAns.personalDetails.age = 15;
minorGuardianAns.under18Guardian = "guardian_present";
printVerdict("Under 18 with guardian", minorGuardianAns);

const existingPatientAns = baseAnswers();
existingPatientAns.existingPatientElsewhere = true;
printVerdict("Already a patient elsewhere", existingPatientAns);

const medicationsAns = baseAnswers();
medicationsAns.currentMedications = "Sertraline 50mg daily, Naproxen as needed";
printVerdict("Current medications declared", medicationsAns);

// ───────────────────────────────────────────────────────────────────────────
// 4. Verdict — compound amber (multiple flags)
// ───────────────────────────────────────────────────────────────────────────

section("VERDICT — Compound amber");

const compoundAns = baseAnswers();
compoundAns.familyPsychosisHistory = true;
compoundAns.priorTreatments = "one";
compoundAns.existingPatientElsewhere = true;
compoundAns.currentMedications = "Citalopram 20mg";
printVerdict("Multiple amber flags combined", compoundAns);
console.log("\n  Formatted for clinic event:");
console.log(formatFlagsForClinic(assessEligibility(compoundAns)).split("\n").map(l => "    " + l).join("\n"));

// ───────────────────────────────────────────────────────────────────────────
// 5. Verdict — red overrides amber (precedence test)
// ───────────────────────────────────────────────────────────────────────────

section("VERDICT — Red takes precedence over Amber");

const redOverAmberAns = baseAnswers();
redOverAmberAns.personalPsychosisHistory = true;        // RED
redOverAmberAns.familyPsychosisHistory = true;          // amber
redOverAmberAns.priorTreatments = "none_with_explanation"; // amber
redOverAmberAns.existingPatientElsewhere = true;        // amber
printVerdict("Red trigger present alongside amber flags", redOverAmberAns);

// ───────────────────────────────────────────────────────────────────────────
// 6. Conditions search + lookup
// ───────────────────────────────────────────────────────────────────────────

section("CONDITIONS — Typeahead search");

function showSearch(q: string) {
  const results = searchTriageConditions(q);
  console.log(`\n  "${q}" → ${results.length} results`);
  results.forEach((r) => console.log(`    • ${r.label} (${r.id}) [${r.group}]`));
}

showSearch("pain");
showSearch("sleep");
showSearch("ms");
showSearch("anxiety");
showSearch("ibd");
showSearch("xyzzy");  // no match
showSearch("ep");     // partial — should surface epilepsy

console.log("\n  findConditionById('chronic_pain'):", findConditionById("chronic_pain")?.label);
console.log("  findConditionById('does_not_exist'):", findConditionById("does_not_exist"));

console.log("\n  isExcludedCondition tests:");
[
  "schizophrenia",
  "I have schizophrenia",
  "bipolar disorder",
  "pregnant",
  "I am breastfeeding",
  "chronic pain",
  "anxiety",
].forEach((s) => console.log(`    "${s}" → ${isExcludedCondition(s)}`));

// ───────────────────────────────────────────────────────────────────────────
// 7. Validation
// ───────────────────────────────────────────────────────────────────────────

section("VALIDATION — Email");
[
  "neil@plantz.io",
  "Neil.Cartwright@Example.Co.UK",
  "neil@plantz",         // no TLD
  "neil..test@x.com",    // consecutive dots
  ".neil@x.com",         // leading dot
  "",
  "not-an-email",
].forEach((e) => console.log(`  "${e}" →`, validateEmail(e)));

section("VALIDATION — UK Mobile");
[
  "07712 345678",
  "07712345678",
  "+44 7712 345678",
  "+447712345678",
  "00447712345678",
  "447712345678",
  "0207 946 0000",       // landline — should fail
  "07712 345",           // too short
  "abcdefg",
  "",
].forEach((p) => console.log(`  "${p}" →`, validateUKMobile(p)));

section("VALIDATION — UK Postcode");
[
  "SW1A 1AA",
  "sw1a1aa",
  "M1 1AE",
  "B33 8TH",
  "CR2 6XH",
  "DN55 1PT",
  "GIR 0AA",             // special — not handled by our regex (acceptable for MVP)
  "12345",
  "",
].forEach((p) => console.log(`  "${p}" →`, validatePostcode(p)));

section("VALIDATION — Age");
[0, 5, 17, 18, 42, 110, 111, -1, 1.5, "42", "abc", ""].forEach((a) =>
  console.log(`  ${JSON.stringify(a)} →`, validateAge(a as never)),
);

section("VALIDATION — Name");
[
  "Neil Cartwright",
  "Siobhán O'Connor",
  "Jean-Luc",
  "Müller",
  "  ",
  "X",
  "Neil2",
  "A".repeat(150),
].forEach((n) => console.log(`  "${n}" →`, validateName(n)));

console.log("\n" + "═".repeat(72));
console.log("  Smoke test complete.");
console.log("═".repeat(72) + "\n");
