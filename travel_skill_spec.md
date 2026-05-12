# Cannavec Travel Skill — Standalone Specification
**Version:** 1.0
**Created:** 2026-05-11
**Status:** PLANNING — approved concept, interface design next
**Location:** `scripts/cannavec/travel_skill_spec.md`
**ClickUp:** https://app.clickup.com/t/869d7yuh3

---

## Access Model

| Item | Detail |
|---|---|
| Where it lives | Cannavec dashboard — post-login only |
| Public site | Not available — Skills are a signup incentive |
| Price | Free for all registered users |
| Monetisation | Skills drive signups; revenue comes from API and MCP access (paid) |
| MCP version | Same retrieval logic exposed as MCP tool for API/MCP subscribers |

This access model applies to all Cannavec Skills. The Skill is the carrot; API/MCP is the revenue.

---

## Why a Distinct Skill

The Patient Travel Planner is separated from the Regulation Skill for three reasons:

1. **B2C vs B2B audience.** The Regulation Skill serves industry professionals — cultivators, clinics, pharmacies. The Travel Skill serves patients directly. These audiences need different tone, different interface, different output format.

2. **Standalone search appeal.** A patient googling "can I take my cannabis to Spain?" should land directly on the Travel Skill, not on a multi-feature regulation platform. The Travel Skill can be indexed, shared, and promoted independently.

3. **Simpler interface.** Two questions — where are you, where are you going — and a result. No persona selection, no business type, no industry context. The simplicity is the product.

The Travel Skill can still be **accessed via the Regulation Skill interface** (as a card within the Patients persona flow), but it has its own URL, its own branding, and its own prompt architecture.

---

## The Core Interface — Radically Simple

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   🌿 Cannabis Travel Planner                           │
│                                                        │
│   I live in:        [Dropdown — country]              │
│                                                        │
│   I'm travelling to: [Dropdown — country]             │
│                                                        │
│   How am I getting there?                             │
│   ○ Flying  ○ Driving  ○ Train or ferry               │
│                                                        │
│   How long am I going for?                            │
│   ○ Up to 7 days  ○ 8–30 days  ○ Over 30 days        │
│                                                        │
│            [ Plan My Trip ]                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

That is the entire input. Four questions. No more.

**Progressive disclosure only:** If the user selects "Flying" and the route is flagged as likely to transit through a high-risk country, the interface surfaces a transit country selector:

```
   Your route may pass through:   [Dropdown — transit country/hub]
   (Leave blank if you have a direct flight)
```

This is the only additional field. It appears conditionally. It does not appear for driving or train journeys.

---

## The Output Structure

Every output follows the same six-section structure, regardless of origin/destination:

### 1. Route Assessment — top of page, always visible first

```
🟢 You can travel with your cannabis to [DESTINATION]
   with the correct documentation.

   — or —

🟠 Travel to [DESTINATION] with cannabis requires
   advance planning and a permit. Read carefully.

   — or —

🔴 Do not travel to [DESTINATION] with cannabis.
   Your prescription provides no legal protection.
   Read this before you book.

   — or —

⚠️ Your route transits [TRANSIT COUNTRY].
   This country has zero tolerance for cannabis.
   Read the transit warning below before continuing.
```

The transit warning appears **above the destination guidance** whenever the route passes through UAE, Qatar, Singapore, or any other high-risk transit hub. It is the first thing the patient sees.

### 2. Transit Warning (conditional — appears only if route is flagged)

Full explanation of the transit risk, what happens at that airport, what to do. Pulled from `patient_travel_high_risk_countries.md`. **This section overrides everything below it for most EU→Oceania routes.** The practical advice for UK→Australia is: do not carry cannabis. You cannot safely transit through the only practical hubs.

### 3. Documents You Need

Specific list with how to obtain each. Pulled from `travel_documentation_by_country.md` and the relevant origin outbound doc. Format:

```
What you need for [DESTINATION]:

  ✓ Your printed prescription
  ✓ A travel letter from your clinic (request 3+ weeks before)
  ✓ Your medicine in original packaging — label must be visible
  ✓ [Any additional country-specific requirement]
```

### 4. Step-by-Step — Before You Go

Numbered action list. No jargon. Written for a patient, not a regulatory professional.

```
1. Book your trip — then do the following before you travel
2. Contact your clinic and request a travel letter
   (Allow [X weeks] — some destinations need advance permits)
3. [Destination-specific step — e.g. email estupefacientes@aemps.es for Spain]
4. Keep all documents in your hand luggage, not hold luggage
5. Carry only what you need for the trip — no more
```

### 5. If You're Stopped

What to say, in plain language. What to do. Embassy number. This section is short and practical.

```
If questioned at the border:

   Stay calm. Present your prescription and travel letter.
   Say: "I have a valid medical prescription.
         Here is my documentation."

   If detained:
   Contact the [ORIGIN COUNTRY] Embassy in [DESTINATION]:
   [Phone number]
```

### 6. What to Do When You Get There

Brief section: can you get a prescription in the destination country if you need one? Where to go if you need medical assistance. Country-specific practical notes.

---

## Output Always Ends With

```
[ Download this guide as PDF ]
[ Email this to my clinic ]
[ Ask a follow-up question ]
[ Check another trip ]
```

The PDF download is the key output feature — patients want to print this and take it with them.

---

## The Transit Intelligence Layer — How It Works

This is the most important technical design decision in the Skill.

When a patient selects "Flying" and enters an origin/destination pair, the Skill applies a routing inference layer before generating output:

```
IF travel_type = "flying"
  lookup route_risk_table[origin][destination]
  IF any likely_transit_hub in high_risk_countries:
    SET transit_warning = TRUE
    SET transit_hubs = [list of flagged hubs]
    PREPEND transit_warning_section to output
    INCLUDE transit_hub_selector in interface
```

### Route risk table — documented at build time

This is a lookup table baked into the Skill, not retrieved from Pinecone. It encodes the routing reality for major city-pair routes. Key entries:

| Origin region | Destination | Likely hubs | Risk |
|---|---|---|---|
| Europe (any) | Australia | Dubai (EK), Doha (QR), Singapore (SQ), Hong Kong (CX) | 🔴 High |
| Europe (any) | New Zealand | Dubai, Doha, Singapore, HK, or via AU | 🔴 High |
| Europe (any) | Thailand | Dubai, Doha, or direct | 🔴 High |
| Europe (any) | East Africa | Dubai, Doha | 🔴 High |
| Europe (any) | South Africa | Dubai (risk), or direct BA/LH/KL (lower risk) | ⚠️ Conditional |
| UK | Canada | Direct, or US transit (JFK/EWR) | ⚠️ US transit: federal issue |
| UK | US | Direct | ❌ Do not carry cannabis |
| Within Schengen | Within Schengen | None | ✅ Lower risk |
| UK | Schengen (any) | None | ✅ Lower risk |

The Skill surfaces this routing analysis and asks the patient to confirm their transit hub if the route is flagged. It does not assume — it asks.

---

## Prompt Architecture — Travel Skill Specific (TS-2 Final)

The Travel Skill uses a dedicated system prompt, separate from the Regulation Skill. Written for patients, not industry professionals.

```
You are the Cannavec Cannabis Travel Planner.

You help medical cannabis patients understand whether they can travel 
with their prescribed medicine, and exactly what they need to do.

You are talking directly to a patient. Write in plain English. 
No jargon. No passive voice. Use "you" throughout. Be warm and direct.

You are not a lawyer. Do not give legal advice. Give regulatory 
information based on verified primary sources, always with the 
date it was last verified.

The patient is travelling:
  FROM: {origin_country}
  TO: {destination_country}
  BY: {travel_type} (Flying / Driving / Train or ferry)
  FOR: {duration}
  TRANSIT HUB: {transit_hub} (if flying and flagged, else "none")

STRUCTURE YOUR RESPONSE IN THIS EXACT ORDER:

1. ROUTE ASSESSMENT (always first)
   One clear sentence. Use one of:
   - "You can travel to [destination] with your cannabis with the 
     right documentation."
   - "Travelling to [destination] with cannabis requires advance 
     planning and a permit."
   - "Do not travel to [destination] with cannabis. Your 
     prescription provides no legal protection there."

2. TRANSIT WARNING (only if transit_hub is flagged as high-risk)
   Show this BEFORE destination guidance. Use the template:
   "Your route passes through [hub_city], [country]. [Country] has 
   zero tolerance for cannabis. Passengers have been arrested at 
   [airport] for trace amounts. Your prescription provides no 
   protection. Consider re-routing or travelling without your 
   cannabis."
   If transit hub makes the journey effectively impossible, say so
   clearly and offer the option to continue with guidance for 
   destination only (assuming no cannabis is carried).

3. DOCUMENTS YOU NEED
   Specific list. What each document is, who provides it, 
   how long it takes to get. No vague generalities.

4. BEFORE YOU GO
   Numbered action steps. Start with the first thing to do after 
   booking. Include lead times for anything that requires advance 
   preparation (e.g. permit applications, travel letters).

5. IF YOU'RE STOPPED
   Short and practical. What to say. Embassy phone number for 
   their origin country in the destination country.

6. WHEN YOU GET THERE
   Brief. Can they get a prescription locally if needed? 
   Any practical notes specific to the destination.

ALWAYS end with:
"This information was verified as of [most recent date in retrieved 
KB content]. Laws change — check with the [destination country] 
embassy before travel."

NEVER:
- Recommend carrying cannabis somewhere it is unsafe
- Present discretionary enforcement as guaranteed protection
- Invent regulatory requirements not in the knowledge base
- Give a definitive answer where the law is genuinely uncertain 
  without flagging that uncertainty
```

### Retrieval strategy — Travel Skill

```
Query 1: jurisdiction=[origin_ISO], question_groups=[H1,H2,H3,H4]
  → Gets: origin outbound doc (what the patient needs to prepare)

Query 2: jurisdiction=[destination_ISO], question_groups=[H1,H4,H6]
  → Gets: destination inbound rules (what the destination country requires)

Query 3: jurisdiction=SCHENGEN, question_groups=[H1,H2,H3]
  → Gets: Schengen mechanism (if either country is Schengen)

Query 4: jurisdiction=GLOBAL, question_groups=[H7,H5,H13]
  → Gets: high-risk country check and transit warnings

Query 5: jurisdiction=GLOBAL, question_groups=[H3,H4,H6]
  → Gets: travel_documentation_by_country for the specific pair

Merge → rerank with cohere-rerank-3.5 → synthesise
```

---

## Matrix Coverage — What the Skill Can Answer Now vs Later

### Available now (Tier 1 docs in Pinecone)

The FROM×TO matrix can give substantive answers for these origin countries:

| Origin | Can answer queries to |
|---|---|
| 🇬🇧 UK | Any destination — including high-risk countries, Schengen, CA, AU, US |
| 🇩🇪 Germany | Any destination |
| 🇨🇦 Canada | Any destination (answer for most: do not travel with cannabis) |
| 🇦🇺 Australia | Any destination — with transit warnings for Oceania routes |

For any Schengen→Schengen route (e.g. NL→ES, CZ→DE), the Schengen mechanism doc covers the core question even without a dedicated NL or CZ outbound doc.

### The gap the UK→Netherlands query exposed

The query tested in this session returned correct information but from the Schengen and UK outbound docs — not from a dedicated Netherlands-as-destination entry. A patient from Germany or Czech Republic flying to the Netherlands would get strong Schengen coverage. A UK patient gets the right answer but via inference, not direct retrieval. The Netherlands outbound doc (T-6a) fills this from the Dutch patient's perspective; what's also needed for completion is a Netherlands destination-specific entry for non-Schengen visitors.

### Tier 2 matrix gaps — priority order for T-6

| Document | Covers | Why this order |
|---|---|---|
| `patient_travel_netherlands_outbound` | NL patients → everywhere | NL is the model Schengen country; fills the UK→NL gap |
| `patient_travel_czechrepublic_outbound` | CZ patients → everywhere | CZ framework doc has good travel section already |
| `patient_travel_france_outbound` | FR patients → everywhere | France is a major origin and destination |
| `patient_travel_spain_outbound` | ES patients → everywhere | AEMPS permit process needs to be in an outbound doc too |
| `patient_travel_greece_outbound` | GR patients → everywhere | Growing market; GR→DE is a real route |
| `patient_travel_newzealand_outbound` | NZ patients → everywhere | NZ→AU is the most common Oceania route |
| `patient_travel_thailand_outbound` | TH patients → everywhere | Note: re-regulated June 2025 — research before authoring |
| `patient_travel_southafrica_outbound` | ZA patients → everywhere | ZA→UK is a real route |

---

## Skill Identity and Access

### Standalone URL
`cannavec.ai/travel` (or `cannavec.ai/patient-travel`)

### Access via Regulation Skill
Under Patients persona → "Plan a trip with my medicine" card → redirects to Travel Skill URL

### Branding
Same Cannavec brand (`#8a9a5a` sage green) but patient-facing tone. Simpler visual design than the Regulation Skill — less dense, more card-based output.

### Pricing access
- Free tier: 3 queries per day
- Registered (free account): 10 queries per day
- Pro/Company: unlimited
- The simplicity of the interface makes it shareable — social/word-of-mouth growth is the acquisition mechanism

---

## What Needs to Be Built

### Interface (Claude builds — Next.js, Tailwind)
- `/travel` route in Cannavec codebase
- Four-question form with progressive disclosure for transit selector
- Output sections rendered as cards
- PDF download button (client-side PDF generation from output)
- "Check another trip" resets the form, clears output

### Prompt + retrieval (Claude builds)
- Travel Skill system prompt (above)
- Five-query Pinecone retrieval chain
- Transit route risk table (hardcoded lookup, not KB)
- Synthesis layer that orders sections correctly

### KB content
- T-1 through T-5 ✅ Already in Pinecone
- T-6a–h: Tier 2 outbound docs (research phase)
- Transit risk table: baked into the Skill at build time

---

## Build Sequence

| Step | Task | Owner | Dependency |
|---|---|---|---|
| TS-1 | Write transit risk table (lookup data) | Claude | None — do now |
| TS-2 | Write Travel Skill system prompt (final version) | Claude | This doc |
| TS-3 | Build `/travel` Next.js route + form interface | Claude | TS-1, TS-2 |
| TS-4 | Build retrieval chain + synthesis | Claude | TS-3 |
| TS-5 | Build PDF download | Claude | TS-4 |
| TS-6 | Test against 10 representative queries | Neil + Claude | TS-5 |
| TS-7 | Launch MVP | Neil | TS-6 |
| TS-8 | Author T-6 Tier 2 outbound docs | Claude | TS-7 |
| TS-9 | Expand transit risk table with Tier 2 origins | Claude | TS-8 |
