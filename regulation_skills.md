# Cannavec Regulation Skill — Feature Specification
**Version:** 1.0
**Created:** 2026-05-08
**Status:** SPECIFICATION — approved for design, not yet built
**Author:** Neil Cartwright + Claude
**Location:** `scripts/cannavec/regulation_skills.md`
**Audience:** Neil, Sophie (UX/design), Saad (frontend), Jack (content)

---

## What This Document Is

This document defines the features and Skills for the Cannavec Regulation Agent — the interface through which Cannavec users access the Cannabis Regulation Knowledge Base.

It covers:
- What each persona needs
- What Skills to build and why
- How each Skill works (inputs, outputs, interface)
- How Skills are grouped and prioritised
- The underlying prompt architecture
- What KB content must exist for each Skill to work

This is the spec. Design and build follow from this. Do not build before this is agreed.

---

## The 4 Personas — What They Need

The Regulation Skill serves four audiences. Every feature decision is measured against these needs.

| Persona | Who they are | Their highest-value question |
|---|---|---|
| **Cultivators** | Cannabis growers, genetics suppliers, cultivation facilities | Can I export my product to Country X, and what do I need to do to get there? |
| **Clinics & Doctors** | Medical cannabis clinics and prescribing physicians | Am I compliant in Country X, and what do I need to tell my patients? |
| **Pharmacies & Wholesalers** | Importers, exporters, distributors of finished products | What licences, certificates and permits do I need, and when do they expire? |
| **Patients** | People with or seeking a prescription | Can I travel with my cannabis, and what do I need to take with me? |

---

## The Interaction Patterns

Before defining specific Skills, it helps to name the distinct types of interaction the Regulation Agent needs to support. These are different in structure, not just topic.

| Pattern | Description | Example |
|---|---|---|
| **Workflow query** | Two or more structured inputs → step-by-step process | "I'm in Country X, I want to export to Country Y — walk me through it" |
| **Due diligence briefing** | One country or market input → structured intelligence report | "Give me a regulatory overview of the German market" |
| **Compliance check** | Specific situation → yes/no/conditional answer with explanation | "Can I prescribe via telemedicine in Australia?" |
| **Gap analysis** | Current state + target state → list of what needs to change | "I have EU-GMP, I want to export to the UK — what's missing?" |
| **Document generation** | Structured inputs → formatted document output | "Write a staff training manual on UK cannabis regulations" |
| **Monitoring digest** | Time period or market selection → what changed | "What's changed in the last 30 days in Germany and the UK?" |
| **Calendar / schedule** | Country and business type → compliance deadline list | "What are my recurring obligations as a UK importer?" |
| **Comparison** | Two or more countries → structured side-by-side | "Compare the prescribing rules in Germany, UK, and Australia" |

Each Skill maps to one or more of these patterns.

---

## The Skills — Full Feature Set

### SKILL 1 — Export Pathway Planner
*"I'm in Country X. I want to export to Country Y. What do I need to do?"*

**Interaction pattern:** Workflow query
**Primary personas:** Cultivators, Pharmacies & Wholesalers
**Secondary personas:** Clinics & Doctors (for cross-border prescribing edge cases)

**What it does:**
Takes an origin country and a destination country as inputs. Returns a structured, step-by-step export pathway: licences required, GMP standard needed, INCB documentation, per-consignment permit process, expected timelines, and recurring obligations once the pathway is established. Includes a "watch out for" section flagging the most common compliance failures on that specific route.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Export Pathway Planner                             │
│                                                     │
│  I am based in:  [Dropdown — origin country]       │
│                                                     │
│  I want to export to:  [Dropdown — destination]    │
│                                                     │
│  My product type:  ○ Flower  ○ Extract/Oil         │
│                    ○ Finished medicine  ○ Genetics  │
│                                                     │
│  My current GMP status:                             │
│  ○ EU-GMP certified  ○ GACP only                   │
│  ○ No GMP certification  ○ Other standard          │
│                                                     │
│  [Generate Export Pathway]                          │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
1. Route summary — is this route currently viable?
2. Licences required (origin country — what you need to hold)
3. Licences required (destination country — what you need to obtain)
4. GMP requirement — what standard is needed and how your current status maps
5. INCB documentation — what is required and who processes it
6. Per-consignment process — what happens for each individual shipment
7. Timeline — realistic end-to-end from first application to first shipment
8. Recurring obligations — what you must renew and when
9. Watch out for — top 3 compliance failure points on this route
10. Sources and last verified date

**KB content required:**
- `[country]_import_export.md` for both origin and destination
- `gmp_requirements_global.md` (planned)
- `[country]_legal_framework.md` for legal status check

**Prompt structure:**
```
You are a cannabis regulatory specialist helping a [product type] operator 
in [origin country] plan an export pathway to [destination country].

Their current GMP status: [status]

Using the regulatory knowledge base, provide a structured export pathway covering:
[structured output sections above]

If the route is not currently viable (e.g. destination country does not permit imports, 
or GMP gap cannot be bridged), say so clearly at the start and explain why.

Always include the last verified date for each piece of regulatory information.
Flag any elements where the information may be subject to imminent change.
```

---

### SKILL 2 — Market Entry Briefing
*"I want to expand my company into Country X. What is the regulatory status there and what do I need to do?"*

**Interaction pattern:** Due diligence briefing
**Primary personas:** Cultivators, Pharmacies & Wholesalers, Clinics & Doctors
**Secondary personas:** (useful for investors/analysts too, though not a primary persona)

**What it does:**
Takes a target country and business type as inputs. Returns a structured market entry intelligence briefing: legal status, market size and maturity, regulatory framework overview, key licences required, timelines, costs where known, key regulatory contacts and authorities, and a candid assessment of the market's attractiveness and risk level. Written for a business decision-maker, not a regulatory specialist.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Market Entry Briefing                              │
│                                                     │
│  Target market:  [Dropdown — country]              │
│                                                     │
│  My business type:                                  │
│  ○ Cultivation / growing                           │
│  ○ Manufacturing / extraction                      │
│  ○ Wholesale / distribution                        │
│  ○ Medical clinic                                  │
│  ○ Pharmacy / dispensary                           │
│  ○ Import / export                                 │
│                                                     │
│  I am currently based in:  [Dropdown — optional]  │
│                                                     │
│  [Generate Market Briefing]                         │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
1. Executive summary — viable market for your business type? Headline assessment.
2. Legal status — current framework, key legislation
3. Market overview — patient/customer numbers, growth trajectory, key operators
4. Regulatory framework — who governs what, key authorities
5. Licence requirements — what you would need to obtain
6. Timeline and cost indicators — realistic expectations
7. Key risks — regulatory, commercial, enforcement
8. Recent changes — what has changed in the last 12 months
9. What to do first — the 3 immediate steps if you decide to proceed
10. Sources and last verified date

**Prompt structure:**
```
You are a cannabis market entry specialist preparing a briefing for 
a [business type] operator considering entering [target country].
[If origin country provided: They are currently based in [origin country].]

Provide a structured market entry briefing that a business decision-maker 
(not a regulatory specialist) can act on. Be direct about whether this 
market is viable for their business type. Where the market is viable, 
be specific about what they need to do and in what order.

Do not hedge where the facts are clear. Where there is genuine uncertainty 
(e.g. a market in flux), say so explicitly.
```

---

### SKILL 3 — Regulatory Alert Digest
*"What regulations have changed recently in Country X that I need to be aware of?"*

**Interaction pattern:** Monitoring digest
**Primary personas:** All four — but most valuable to Clinics & Doctors and Pharmacies & Wholesalers
**Secondary personas:** —

**What it does:**
Returns a structured digest of regulatory changes in a selected country (or set of countries) within a selected time window. Draws from the KB's `last_updated` metadata and Changelog sections in each document, supplemented by the Feedly triage system (Track B). This is the user-facing surface of the update infrastructure built in the architecture phase.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Regulatory Alert Digest                            │
│                                                     │
│  Countries:  [Multi-select checkboxes]             │
│  □ United Kingdom  □ Germany  □ Canada             │
│  □ Australia  □ United States  □ All my markets    │
│                                                     │
│  Time period:                                       │
│  ○ Last 30 days  ○ Last 90 days  ○ Last 12 months  │
│                                                     │
│  Focus area:  [Optional — dropdown]                │
│  ○ All changes  ○ Prescribing  ○ Import/Export     │
│  ○ Advertising  ○ Patient travel  ○ Product compliance │
│                                                     │
│  [Generate Digest]                                  │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
Per country, per time period:
1. Summary — how many changes, overall significance
2. Critical changes (if any) — flagged prominently
3. High priority changes — with what changed, when, and what action is needed
4. Medium/low changes — listed briefly
5. Upcoming changes — known future changes (bills passed but not yet in force)
6. No-change confirmation — sections confirmed unchanged (reassuring for compliance purposes)

**Prompt structure:**
```
You are a cannabis regulatory monitoring specialist preparing a digest 
for a cannabis industry professional.

Using KB documents with recent Changelog entries and the following 
Feedly-sourced regulatory alerts, produce a structured digest of 
changes in [country list] over the [time period].

Prioritise by operational impact. Be specific about what changed — 
not just that something changed. Where a change requires action, 
say so explicitly and describe what the action is.

Format: one section per country, changes listed by urgency (critical first).
```

**Note:** This Skill's output quality depends directly on the update system (Track A + Track B) being operational and KB documents having current Changelog sections. Initially this Skill will work with what's in the KB. It becomes significantly more powerful once the monitoring infrastructure is live.

---

### SKILL 4 — Staff Training Manual Generator
*"I need to educate my employees on the current rules and regulations. Write a training manual with questions at the end."*

**Interaction pattern:** Document generation
**Primary personas:** Clinics & Doctors, Pharmacies & Wholesalers
**Secondary personas:** Cultivators

**What it does:**
Generates a structured, compliance-accurate training manual for cannabis industry employees in a specified country and role. Includes a knowledge check section (multiple choice and short answer questions) at the end. The manual is written for the employee audience — clear, jargon-explained, practical — not for regulators.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Staff Training Manual Generator                    │
│                                                     │
│  Country / jurisdiction:  [Dropdown]               │
│                                                     │
│  Staff role:                                        │
│  ○ Clinic reception / administration               │
│  ○ Prescribing doctor / nurse prescriber           │
│  ○ Pharmacy dispenser                              │
│  ○ Warehouse / logistics                           │
│  ○ Sales / business development                    │
│  ○ All roles (general compliance overview)          │
│                                                     │
│  Topics to cover:  [Checkboxes]                    │
│  □ Legal status and what is permitted              │
│  □ Prescribing rules (who, how, what forms)        │
│  □ Storage and handling requirements               │
│  □ Advertising and marketing rules                 │
│  □ Patient rights and travel                       │
│  □ Driving and impairment rules                    │
│  □ What to do if inspected or audited              │
│  □ Reporting obligations                           │
│                                                     │
│  Include knowledge check questions?  ○ Yes  ○ No  │
│  Number of questions:  [5 / 10 / 15 / 20]         │
│                                                     │
│  [Generate Training Manual]                         │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
1. Introduction — purpose of this manual, how to use it
2. Legal framework — what is legal, what is not, key legislation
3. Role-specific section — rules and obligations specific to this role
4. Topic sections (as selected)
5. Key contacts and escalation — who to call if unsure
6. Knowledge check — mix of multiple choice, true/false, and short answer
7. Answer key (separate section, can be withheld from trainees)
8. "This manual was accurate as of [date] — check for updates every [cadence]"

**Prompt structure:**
```
You are a cannabis compliance training specialist. 
Generate a staff training manual for [role] employees working in [country].

The manual should be written for the employee — clear language, 
practical examples, jargon explained on first use. 
Not for regulators. Not for lawyers.

Topics to cover: [selected topics]

Include [N] knowledge check questions at the end — a mix of multiple choice 
and short answer. Cover all major topics. Include an answer key.

At the end of the manual, include a prominent notice: 
"This manual reflects regulations as of [last_updated date for relevant KB documents]. 
Always check [relevant authority] for the latest guidance."

Ground every statement in the current KB regulatory content. 
If a topic is not covered in the KB for this country, say so rather than guessing.
```

---

### SKILL 5 — GMP Gap Analysis
*"I have [certification X]. I want to export to Country Y. What do I need to bridge the gap?"*

**Interaction pattern:** Gap analysis
**Primary personas:** Cultivators, Pharmacies & Wholesalers
**Secondary personas:** —

**What it does:**
Takes the user's current GMP certification status and target export market(s). Returns a structured analysis of what GMP standard is required, whether their current certification is accepted or equivalent, and if not, what steps are required to close the gap — including which certification bodies to approach, typical timelines, and cost indicators.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  GMP Gap Analysis                                   │
│                                                     │
│  My current certification:  [Checkboxes]           │
│  □ EU-GMP (EMA)  □ GACP  □ PIC/S                   │
│  □ TGA GMP  □ Health Canada GPP  □ ISO 22716       │
│  □ No certification  □ Other: [text input]          │
│                                                     │
│  My role in the supply chain:                       │
│  ○ Cultivator (GACP stage)                         │
│  ○ Manufacturer / processor (GMP stage)            │
│  ○ Both                                            │
│                                                     │
│  Target export market(s):  [Multi-select]          │
│  □ Germany  □ United Kingdom  □ Australia          │
│  □ Canada  □ Other EU markets  □ All listed        │
│                                                     │
│  [Run Gap Analysis]                                 │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
Per target market:
1. Required standard — what GMP level is mandatory for import
2. Your current status — is your certification accepted, equivalent, or insufficient?
3. Gap (if any) — exactly what is missing
4. Pathway to close the gap — steps, who to contact, typical timeline
5. Mutual recognition — does your country's regulatory authority have a mutual recognition arrangement with the target market?
6. Practical next steps — the 3 actions to take immediately
7. Sources and last verified date

---

### SKILL 6 — Compliance Calendar Builder
*"What are all my recurring regulatory obligations, and when are they due?"*

**Interaction pattern:** Calendar / schedule
**Primary personas:** Pharmacies & Wholesalers, Cultivators
**Secondary personas:** Clinics & Doctors

**What it does:**
Takes a country and business type. Returns a structured calendar of recurring compliance obligations — licence renewals, inspection schedules, certificate expiry windows, INCB quota notification deadlines, annual reporting requirements. Designed to be copied into a compliance calendar or project management tool.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Compliance Calendar Builder                        │
│                                                     │
│  Country / jurisdiction:  [Dropdown]               │
│                                                     │
│  Business type:                                     │
│  ○ Cultivator / grower                             │
│  ○ Manufacturer / processor                        │
│  ○ Importer                                        │
│  ○ Exporter                                        │
│  ○ Wholesaler / distributor                        │
│  ○ Medical clinic                                  │
│  ○ Pharmacy                                        │
│                                                     │
│  [Build My Compliance Calendar]                     │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
Organised by month / frequency:

```
ANNUAL (do once per year)
  □ Home Office import licence renewal — apply 90 days before expiry
  □ INCB quota notification — submit by Q4 for following year
  □ Annual GMP self-inspection — document and file internally

EVERY 3 YEARS
  □ MHRA GMP site inspection — initiate contact 9 months before due date

PER SHIPMENT
  □ Home Office per-consignment import licence — apply 10 working days before
  □ INCB export authorisation — request from exporting country's authority

QUARTERLY
  □ Internal SOPs review — check against latest MHRA guidance
```

Followed by: an explanation of each obligation, the authority responsible, consequences of missing the deadline, and the source document last verified date.

**Note:** This Skill depends on the "Recurring Obligations" H2 sections being present in the relevant KB documents. These sections are being added to all Tier 1 country framework and import/export documents as part of the current authoring programme.

---

### SKILL 7 — Prescribing Eligibility Checker
*"Can I prescribe cannabis for condition X in Country Y, and how?"*

**Interaction pattern:** Compliance check
**Primary personas:** Clinics & Doctors
**Secondary personas:** Patients (simpler version)

**What it does:**
Takes a medical condition, a country, and optionally a prescriber type (specialist vs GP, telemedicine vs in-person). Returns a clear yes/no/conditional answer with the supporting rationale, the specific prescription pathway (forms, approval requirements), and any restrictions or special considerations.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Prescribing Eligibility Checker                    │
│                                                     │
│  Country:  [Dropdown]                              │
│                                                     │
│  Medical condition:  [Text input or dropdown]      │
│  (e.g. chronic pain, epilepsy, MS, PTSD, nausea)  │
│                                                     │
│  Prescriber type:                                   │
│  ○ Specialist physician  ○ GP / general practitioner│
│  ○ Nurse prescriber  ○ Not sure                    │
│                                                     │
│  Consultation type:                                 │
│  ○ In-person  ○ Telemedicine  ○ Either             │
│                                                     │
│  Patient age group:                                 │
│  ○ Adult (18+)  ○ Minor (under 18)  ○ Elderly (65+)│
│                                                     │
│  [Check Eligibility]                               │
└─────────────────────────────────────────────────────┘
```

**Output structure:**
1. Eligibility verdict — Yes / No / Conditional (clearly stated)
2. Reason — the regulatory basis for the verdict
3. Prescription pathway — if yes or conditional, the steps to prescribe
4. Restrictions — any special requirements (specialist referral, prior treatment requirements, approval bodies)
5. Telemedicine status — is remote prescribing permitted for this combination?
6. Paediatric considerations — additional rules if patient is a minor
7. What to tell the patient — driving rules, travel implications, workplace
8. Sources and last verified date

---

### SKILL 8 — Clinic Setup Checklist
*"I want to open a medical cannabis clinic in Country X. What do I need?"*

**Interaction pattern:** Workflow query + document generation
**Primary personas:** Clinics & Doctors
**Secondary personas:** Pharmacies & Wholesalers (where clinic includes dispensing)

**What it does:**
Takes a country and clinic type. Returns a structured checklist of everything needed to legally establish and operate a medical cannabis clinic — premises requirements, licences, responsible person requirements, prescriber registration, advertising rules, inspection preparation, and ongoing compliance obligations.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Clinic Setup Checklist                             │
│                                                     │
│  Country:  [Dropdown]                              │
│                                                     │
│  Clinic model:                                      │
│  ○ Prescribing clinic (no dispensing on site)      │
│  ○ Prescribing + in-house pharmacy                 │
│  ○ Telemedicine only                               │
│  ○ Telemedicine + in-person                        │
│                                                     │
│  Stage I am at:                                     │
│  ○ Just exploring — give me everything             │
│  ○ Premises secured — what licences do I need?    │
│  ○ Licences in progress — what else to prepare?   │
│  ○ Open but need compliance review                 │
│                                                     │
│  [Generate Checklist]                              │
└─────────────────────────────────────────────────────┘
```

**Output:** A checklist document structured by phase (pre-opening, opening, ongoing), with each item as a checkbox, the responsible authority, and a brief explanation. Exportable.

---

### SKILL 9 — Country Comparison
*"Compare the regulatory environment across these markets."*

**Interaction pattern:** Comparison
**Primary personas:** Pharmacies & Wholesalers, Cultivators
**Secondary personas:** Clinics & Doctors (comparing markets for expansion)

**What it does:**
Takes 2–5 countries and a focus area. Returns a structured side-by-side comparison table with narrative context. Designed for business decision-making — which market is easiest to enter, which has the most onerous GMP requirements, where is reimbursement available.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Country Comparison                                 │
│                                                     │
│  Select countries to compare:  [Multi-select]      │
│  □ UK  □ Germany  □ Canada  □ Australia  □ US      │
│  □ Netherlands  □ Switzerland  □ Czech Republic    │
│  □ New Zealand  □ Portugal  □ Thailand             │
│                                                     │
│  Compare on:  [Checkboxes — max 4]                 │
│  □ Legal status and framework                      │
│  □ GMP requirements for import                     │
│  □ Prescribing access (conditions, who can prescribe)│
│  □ Market size and growth                          │
│  □ Regulatory complexity (ease of market entry)    │
│  □ Import/export process                           │
│  □ Advertising rules                               │
│  □ Patient travel rules                            │
│                                                     │
│  [Generate Comparison]                             │
└─────────────────────────────────────────────────────┘
```

**Output:** Comparison table followed by narrative summary of key differences and implications.

---

### SKILL 10 — Patient Travel Planner
*Now a standalone Skill — see `travel_skill_spec.md`*

The Patient Travel Planner has been separated from the Regulation Skill into its own distinct product. It has its own URL (`cannavec.ai/travel`), its own system prompt, its own retrieval architecture, and its own B2C-focused interface. It can be accessed via the Regulation Skill interface under the Patients persona, but it is not part of the Regulation Skill build.

See `scripts/cannavec/travel_skill_spec.md` for the full specification.

---

### SKILL 11 — Seed & Genetics Legality Checker
*"Can I import/export these genetics to/from Country X?"*

**Interaction pattern:** Compliance check
**Primary personas:** Cultivators
**Secondary personas:** Pharmacies & Wholesalers (for seed/cutting-based supply chains)

**What it does:**
Cannabis genetics (seeds, cuttings, tissue culture) are subject to separate and often stricter rules than finished products. This Skill checks whether the movement of genetics between two countries is legal, what is required (phytosanitary certificates, import permits, THC limits for seeds), and any plant variety registration considerations.

**Interface:**
```
┌─────────────────────────────────────────────────────┐
│  Genetics Legality Checker                          │
│                                                     │
│  Origin country:  [Dropdown]                       │
│                                                     │
│  Destination country:  [Dropdown]                  │
│                                                     │
│  Material type:                                     │
│  ○ Seeds (feminised)  ○ Seeds (regular/autoflower) │
│  ○ Cuttings / clones  ○ Tissue culture             │
│  ○ Pollen  ○ CBD/hemp seeds                        │
│                                                     │
│  Purpose:                                           │
│  ○ Commercial cultivation  ○ Research              │
│  ○ Breeding programme  ○ Personal (not commercial) │
│                                                     │
│  [Check Legality]                                  │
└─────────────────────────────────────────────────────┘
```

**Note:** This Skill requires additional KB content not yet authored — a genetics and seed import/export document per country. It is a Phase 2 Skill.

---

## Skills Priority and Phasing

### Phase 1 — Core Skills (build first)

These cover the highest-volume questions and are fully supported by existing KB content.

| Skill | Reason for Phase 1 |
|---|---|
| **Skill 1 — Export Pathway Planner** | Highest commercial value; import/export docs live in Pinecone |
| **Skill 2 — Market Entry Briefing** | Broadest appeal; works with existing framework docs |
| **Skill 3 — Regulatory Alert Digest** | Showcases freshness / update system; differentiates from static tools |
| **Skill 7 — Prescribing Eligibility Checker** | Direct clinic value; prescribing content exists for Tier 1 countries |
| **Skill 10 — Patient Travel Planner** | Highest patient demand; travel docs being authored now (H-A, H-B) |

### Phase 2 — Extended Skills (after Phase 1 proven)

| Skill | Dependency |
|---|---|
| **Skill 4 — Staff Training Manual Generator** | Works with Phase 1 KB but output quality improves with Group G content |
| **Skill 5 — GMP Gap Analysis** | Requires `gmp_requirements_global.md` (not yet authored) |
| **Skill 6 — Compliance Calendar Builder** | Requires "Recurring Obligations" sections in all Tier 1 docs |
| **Skill 8 — Clinic Setup Checklist** | Requires Group G (advertising) content per country |
| **Skill 9 — Country Comparison** | Works now but improves significantly with more Tier 1 depth |

### Phase 3 — Specialist Skills

| Skill | Dependency |
|---|---|
| **Skill 11 — Genetics Legality Checker** | Requires new KB content (genetics/seed import docs per country) |

---

## The Underlying Prompt Architecture

All Skills share a common prompt structure. This ensures consistency, citation discipline, and appropriate hedging.

### System prompt (Regulation Agent — all Skills)

```
You are the Cannavec Regulation Agent — a specialist cannabis regulatory 
intelligence tool built on the Cannabis Knowledge Foundation knowledge base.

Your purpose is to provide accurate, actionable regulatory information 
to cannabis industry professionals and patients. You are not a lawyer 
and do not provide legal advice. You provide regulatory information 
based on verified primary sources.

Always:
- State the last verified date for any regulatory information you provide
- Cite the specific regulation, guidance document, or authority that your 
  answer is based on
- Distinguish clearly between: "this is the current rule" and 
  "this was the rule as of [date] — verify before acting"
- Flag when a rule is subject to pending change or known uncertainty
- Recommend seeking professional legal or regulatory advice for 
  high-stakes decisions

Never:
- Invent regulatory requirements not in the knowledge base
- Present outdated information as current without flagging it
- Provide a definitive answer in areas of genuine legal ambiguity 
  without acknowledging that ambiguity
- Recommend illegal activity in any jurisdiction
```

### Per-Skill prompt additions

Each Skill adds a structured context block to the system prompt:

```
SKILL: [Skill name]
USER INPUTS: [structured inputs from the interface]
OUTPUT FORMAT: [specific sections required for this Skill]
TONE: [Business formal / Clinical / Plain English for patients]
KB NAMESPACES TO QUERY: [cannabis/regulation + specific filter metadata]
```

### Retrieval strategy — regulation-specific

The Regulation Agent queries Pinecone with jurisdiction-filtered retrieval:

```
Filter: jurisdiction = [ISO country code]
Filter: domain_layer = "regulation"
Filter: question_groups contains [relevant group — A, B, D, E, F, G, H]
Top K: 8–12 sections
Reranker: cohere-rerank-3.5
```

For cross-country Skills (comparison, export pathway), multiple jurisdiction-filtered queries are run and results are merged before synthesis.

---

## Interface Design Principles

### For Sophie

These principles should guide the UX design of every Skill interface:

1. **Dropdowns over free text wherever possible.** Country names, business types, certification standards — all dropdown. Free text only for condition names and custom inputs. This prevents garbage-in and makes the prompt more precise.

2. **Progressive disclosure.** Show the minimum number of fields initially. Reveal additional options only when relevant to previous selections (e.g. "telemedicine rules" section only appears if "Telemedicine" is selected as consultation type).

3. **One Skill per page.** Each Skill has its own page/route. The Skills directory is the hub.

4. **Output is always copyable.** Users should be able to copy the full output as structured text, or download as PDF. The Training Manual Generator should offer PDF export as standard.

5. **Freshness is always visible.** Every output shows the knowledge base verification date prominently. "This information was verified as of [date]." This is a trust signal, not a disclaimer.

6. **Uncertainty is explicit.** Where the KB doesn't cover something, the output says so clearly. "We don't currently have detailed information on [country X] for this query — our coverage of this market is [Tier 2 / Tier 3]. We recommend [authority] for the most current guidance."

7. **Access model — dashboard only, free post-signup.** Skills are available to all registered Cannavec users at no charge. They are not available on the public-facing marketing site — the Skills are the reason to sign up. Revenue comes from API and MCP access (paid tiers), not from the Skills themselves. Free users do not have rate limits on Skills; rate limits apply only to raw API access.

---

## MCP Equivalents

Every Skill built for the web interface should also be available as an MCP tool. The MCP version takes the same inputs as parameters rather than a form interface.

Example — Export Pathway Planner as MCP tool:

```json
{
  "name": "regulation_export_pathway",
  "description": "Generate a cannabis export pathway from one country to another, including licence requirements, GMP standard needed, INCB documentation, and timeline.",
  "parameters": {
    "origin_country": "ISO country code (e.g. GB, DE, CA)",
    "destination_country": "ISO country code",
    "product_type": "flower | extract | finished_medicine | genetics",
    "current_gmp_status": "eu_gmp | gacp_only | none | other"
  }
}
```

This is the interface for developers building on the Cannavec API. The same KB retrieval logic runs underneath both the web Skill and the MCP tool.

---

## What Needs to Be Built Before Each Skill Can Launch

| Skill | KB content needed | System needed |
|---|---|---|
| Skill 1 | Import/export docs for Tier 1 ✅ | Skill interface + prompt |
| Skill 2 | Framework docs for Tier 1 ✅ | Skill interface + prompt |
| Skill 3 | Changelog sections in all docs + update system | Track A + Track B operational |
| Skill 4 | Group G advertising content per country | Skill interface + PDF export |
| Skill 5 | `gmp_requirements_global.md` | Skill interface + prompt |
| Skill 6 | "Recurring Obligations" sections in Tier 1 docs | Skill interface + export |
| Skill 7 | Prescribing framework docs per country | Skill interface + condition list |
| Skill 8 | Group G advertising content + clinic setup docs | Skill interface + checklist export |
| Skill 9 | Tier 1 + Tier 2 depth across all comparison dimensions | Skill interface + table rendering |
| Skill 10 | H-A foundation travel docs + H-B origin travel docs | Skill interface + high-risk warnings |
| Skill 11 | New genetics/seed import docs (not yet authored) | Skill interface + prompt |

---

## Related Documents

| Document | Purpose |
|---|---|
| `ARCHITECTURE.md` | Update system architecture — powers Skill 3 (Alert Digest) |
| `REGULATION_SKILL_STRATEGY.md` | Personas, KB priorities, team assignments |
| `update_rules_regs_laws.md` | Update workflow — how KB content stays current |
| `30-questions.md` | The question groups that map to Skill retrieval filters |
| `country-tiers.md` | Which countries are covered at what depth |
| `CANNAVEC_CONTEXT.md` | Cannavec platform overview — tech stack, pricing, existing Skills |
