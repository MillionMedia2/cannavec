/**
 * Triage — Conditions
 * --------------------
 * Curated list of conditions the Triage agent treats as "treatable with medical cannabis."
 *
 * NOT a hardcoded eligibility gate. At runtime, the Triage workflow calls /api/chatbot
 * to verify the user's stated condition against the live KB. This file exists to:
 *   1. Power the typeahead/autocomplete UI (user starts typing → matches surface)
 *   2. Make condition aliases ("pain" → chronic_pain, neuropathic_pain, fibromyalgia, etc.) clean
 *   3. Track the explicit EXCLUSION list — conditions which are contraindications, not treatable
 *
 * Source of truth: knowledge/cannabis/mc-knowledge-base/cannabis/5. Medical & Therapeutic Use/5.1 Conditions/
 *
 * Excluded conditions (do NOT appear in the picker, locked 2026-05-15):
 *   - schizophrenia            → contraindication; THC can worsen psychotic symptoms
 *   - psychosis (active)       → contraindication; not present as standalone KB file
 *   - bipolar (in mania)       → contraindication; THC risks triggering manic/psychotic episodes
 *   - cannabis_use_disorder    → caused by cannabis, not treated with it
 *   - cannabinoid_hyperemesis_syndrome → caused by cannabis, not treated with it
 *   - cannabis_in_pregnancy    → pregnancy is a hard contraindication; handled separately
 *   - hyperemesis_gravidarum   → pregnancy-related; not appropriate for triage
 *
 * Reference: knowledge/cannabis/projects/Triage Agent/architecture.md § 2
 */

export interface TriageCondition {
  /** Stable ID — matches KB filename without .md extension where one exists. */
  id: string;
  /** Patient-facing label. */
  label: string;
  /** Search aliases — terms the typeahead will match against. */
  aliases: string[];
  /**
   * Whether this condition needs a follow-up "tell me more" question.
   * Generic conditions (pain, sleep, anxiety) do; specific ones (MS, epilepsy) get a "how long?" follow-up instead.
   */
  needsDetail: "more_info" | "duration_only";
  /** Optional grouping for display. */
  group: ConditionGroup;
}

export type ConditionGroup =
  | "pain"
  | "mental_health"
  | "sleep"
  | "neurological"
  | "gastrointestinal"
  | "womens_health"
  | "skin"
  | "metabolic"
  | "cancer_palliative"
  | "other";

/** Conditions explicitly excluded — see header comment for rationale. */
export const EXCLUDED_CONDITION_IDS: readonly string[] = [
  "schizophrenia",
  "psychosis_active",
  "bipolar_mania",
  "cannabis_use_disorder",
  "cannabinoid_hyperemesis_syndrome",
  "cannabis_in_pregnancy",
  "hyperemesis_gravidarum",
] as const;

/**
 * Triage condition catalogue.
 *
 * NOTE: This is intentionally curated and human-maintained, not auto-derived from KB files.
 * The KB has 60+ condition files including some that are not appropriate for a patient-facing
 * eligibility picker (e.g. drug-interaction red flags, hepatic safety). The picker shows
 * patient-recognisable presenting complaints, not every clinical entity in the KB.
 */
export const TRIAGE_CONDITIONS: TriageCondition[] = [
  // Pain
  { id: "chronic_pain", label: "Chronic pain", aliases: ["pain", "long-term pain", "persistent pain"], needsDetail: "more_info", group: "pain" },
  { id: "neuropathic_pain", label: "Neuropathic pain (nerve pain)", aliases: ["nerve pain", "neuralgia", "neuropathy", "burning pain"], needsDetail: "duration_only", group: "pain" },
  { id: "fibromyalgia", label: "Fibromyalgia", aliases: ["fibro", "widespread pain"], needsDetail: "duration_only", group: "pain" },
  { id: "arthritis_joint_disease", label: "Arthritis / joint pain", aliases: ["arthritis", "rheumatoid", "osteoarthritis", "joint pain"], needsDetail: "duration_only", group: "pain" },
  { id: "migraine_headache", label: "Migraine", aliases: ["migraines", "headache"], needsDetail: "duration_only", group: "pain" },
  { id: "cluster_headache", label: "Cluster headache", aliases: ["cluster headaches"], needsDetail: "duration_only", group: "pain" },
  { id: "endometriosis_pain", label: "Endometriosis", aliases: ["endo", "pelvic pain", "period pain"], needsDetail: "duration_only", group: "womens_health" },
  { id: "diabetic_peripheral_neuropathy", label: "Diabetic neuropathy", aliases: ["diabetic nerve pain"], needsDetail: "duration_only", group: "pain" },
  { id: "sickle_cell_disease", label: "Sickle cell pain", aliases: ["sickle cell"], needsDetail: "duration_only", group: "pain" },
  { id: "acute_pancreatitis_cannabis", label: "Pancreatitis pain", aliases: ["pancreatitis"], needsDetail: "duration_only", group: "pain" },

  // Mental health (treatable — not contraindicated)
  { id: "anxiety_disorders", label: "Anxiety", aliases: ["anxiety", "generalised anxiety", "GAD", "panic"], needsDetail: "more_info", group: "mental_health" },
  { id: "ptsd", label: "PTSD (post-traumatic stress)", aliases: ["ptsd", "trauma", "post-traumatic stress disorder", "c-ptsd"], needsDetail: "duration_only", group: "mental_health" },
  { id: "depression_mood_disorders", label: "Depression / low mood", aliases: ["depression", "low mood", "mood disorder"], needsDetail: "duration_only", group: "mental_health" },
  { id: "adhd", label: "ADHD", aliases: ["adhd", "attention deficit", "add"], needsDetail: "duration_only", group: "mental_health" },
  { id: "autism_spectrum_disorder", label: "Autism spectrum disorder", aliases: ["autism", "asd", "asperger"], needsDetail: "duration_only", group: "mental_health" },
  { id: "tourette_syndrome", label: "Tourette syndrome", aliases: ["tourettes", "tics"], needsDetail: "duration_only", group: "mental_health" },

  // Sleep
  { id: "sleep_disorders_insomnia", label: "Insomnia / sleep problems", aliases: ["sleep", "insomnia", "cant sleep", "poor sleep"], needsDetail: "more_info", group: "sleep" },
  { id: "restless_leg_syndrome", label: "Restless leg syndrome", aliases: ["rls", "restless legs"], needsDetail: "duration_only", group: "sleep" },

  // Neurological
  { id: "multiple_sclerosis_spasticity", label: "Multiple sclerosis (MS)", aliases: ["ms", "multiple sclerosis", "spasticity"], needsDetail: "duration_only", group: "neurological" },
  { id: "treatment_resistant_epilepsy", label: "Treatment-resistant epilepsy", aliases: ["epilepsy", "seizures", "dravet", "lennox-gastaut"], needsDetail: "duration_only", group: "neurological" },
  { id: "tuberous_sclerosis_complex", label: "Tuberous sclerosis complex", aliases: ["tsc", "tuberous sclerosis"], needsDetail: "duration_only", group: "neurological" },
  { id: "parkinson_disease", label: "Parkinson's disease", aliases: ["parkinsons", "parkinson"], needsDetail: "duration_only", group: "neurological" },
  { id: "dystonia", label: "Dystonia", aliases: ["dystonia", "muscle spasm"], needsDetail: "duration_only", group: "neurological" },
  { id: "neurodegeneration_alzheimer_huntington_als", label: "Alzheimer's / Huntington's / ALS", aliases: ["alzheimer", "huntington", "als", "motor neurone", "dementia"], needsDetail: "duration_only", group: "neurological" },
  { id: "chronic_fatigue_syndrome", label: "Chronic fatigue syndrome / ME", aliases: ["cfs", "me", "chronic fatigue", "myalgic encephalomyelitis"], needsDetail: "duration_only", group: "neurological" },

  // Gastrointestinal
  { id: "inflammatory_bowel_disease", label: "Inflammatory bowel disease (Crohn's / colitis)", aliases: ["ibd", "crohns", "crohn", "ulcerative colitis"], needsDetail: "duration_only", group: "gastrointestinal" },
  { id: "irritable_bowel_syndrome", label: "Irritable bowel syndrome (IBS)", aliases: ["ibs", "irritable bowel"], needsDetail: "duration_only", group: "gastrointestinal" },
  { id: "gerd", label: "GERD / acid reflux", aliases: ["gerd", "reflux", "heartburn"], needsDetail: "duration_only", group: "gastrointestinal" },

  // Women's health (non-pain)
  { id: "female_sexual_health_libido", label: "Female sexual health / libido", aliases: ["libido", "sexual health"], needsDetail: "duration_only", group: "womens_health" },

  // Skin / dermatology
  { id: "psoriasis", label: "Psoriasis", aliases: ["psoriasis"], needsDetail: "duration_only", group: "skin" },
  { id: "atopic_dermatitis_pruritus", label: "Eczema / atopic dermatitis / itching", aliases: ["eczema", "dermatitis", "itching", "pruritus"], needsDetail: "duration_only", group: "skin" },
  { id: "acne", label: "Acne", aliases: ["acne"], needsDetail: "duration_only", group: "skin" },
  { id: "skin_dermatology_general", label: "Other skin condition", aliases: ["skin"], needsDetail: "more_info", group: "skin" },

  // Cancer / palliative
  { id: "cancer_palliative_care", label: "Cancer (palliative care)", aliases: ["cancer", "palliative", "end of life"], needsDetail: "duration_only", group: "cancer_palliative" },
  { id: "chemotherapy_induced_nausea_vomiting", label: "Chemotherapy nausea & vomiting", aliases: ["chemo", "chemotherapy nausea", "cinv"], needsDetail: "duration_only", group: "cancer_palliative" },
  { id: "cachexia_anorexia", label: "Cachexia / wasting / appetite loss", aliases: ["cachexia", "wasting", "appetite loss"], needsDetail: "duration_only", group: "cancer_palliative" },
  { id: "elderly_aging_palliative", label: "Palliative care (elderly)", aliases: ["palliative elderly"], needsDetail: "duration_only", group: "cancer_palliative" },

  // Metabolic / endocrine
  { id: "type_2_diabetes_metabolic", label: "Type 2 diabetes / metabolic", aliases: ["diabetes", "metabolic syndrome"], needsDetail: "duration_only", group: "metabolic" },
  { id: "obesity_appetite_regulation", label: "Obesity / appetite regulation", aliases: ["obesity", "weight"], needsDetail: "duration_only", group: "metabolic" },

  // Other systemic
  { id: "systemic_sclerosis_scleroderma", label: "Systemic sclerosis / scleroderma", aliases: ["scleroderma", "systemic sclerosis"], needsDetail: "duration_only", group: "other" },
  { id: "mast_cell_allergic_disease", label: "Mast cell activation / allergic disease", aliases: ["mcas", "mast cell", "allergies"], needsDetail: "duration_only", group: "other" },
  { id: "inflammation_general", label: "Chronic inflammation", aliases: ["inflammation"], needsDetail: "more_info", group: "other" },
  { id: "hiv_aids_symptom_management", label: "HIV/AIDS symptom management", aliases: ["hiv", "aids"], needsDetail: "duration_only", group: "other" },
  { id: "glaucoma", label: "Glaucoma", aliases: ["glaucoma", "eye pressure"], needsDetail: "duration_only", group: "other" },
  { id: "bone_health_osteoporosis", label: "Osteoporosis / bone health", aliases: ["osteoporosis", "bone"], needsDetail: "duration_only", group: "other" },
];

/**
 * Search the curated catalogue for typeahead. Case-insensitive, matches label + aliases.
 * Returns up to `limit` results, ranked: exact label match > label-starts-with > alias-exact > alias-includes.
 */
export function searchTriageConditions(query: string, limit = 8): TriageCondition[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  type Scored = { c: TriageCondition; score: number };
  const scored: Scored[] = [];

  for (const c of TRIAGE_CONDITIONS) {
    const labelLower = c.label.toLowerCase();
    let score = 0;

    if (labelLower === q) score = 100;
    else if (labelLower.startsWith(q)) score = 80;
    else if (labelLower.includes(q)) score = 50;

    for (const alias of c.aliases) {
      const a = alias.toLowerCase();
      if (a === q) score = Math.max(score, 70);
      else if (a.startsWith(q)) score = Math.max(score, 60);
      else if (a.includes(q)) score = Math.max(score, 30);
    }

    if (score > 0) scored.push({ c, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.c);
}

/** Look up a condition by ID. Returns undefined if not found (free-text condition). */
export function findConditionById(id: string): TriageCondition | undefined {
  return TRIAGE_CONDITIONS.find((c) => c.id === id);
}

/**
 * Returns true if the given text matches one of the explicitly excluded conditions.
 * Used at step 1 of the wizard to short-circuit into a contraindication flow
 * before involving /api/chatbot.
 */
export function isExcludedCondition(input: string): boolean {
  const q = input.trim().toLowerCase();
  if (q.length < 3) return false;

  const excludedTerms = [
    "schizophrenia", "schizo",
    "psychosis", "psychotic",
    "bipolar", "manic episode", "mania",
    "cannabis use disorder", "cud",
    "cannabinoid hyperemesis", "chs",
    "pregnancy", "pregnant", "breastfeed", "lactation",
  ];

  return excludedTerms.some((term) => q.includes(term));
}
