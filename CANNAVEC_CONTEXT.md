# Cannavec.ai — Project Context

> **Read this file at the start of every session involving Cannavec.**
> It is the single source of truth for what Cannavec is, how it works, how it fits into the broader Plantz ecosystem, and what is planned.

---

## What Cannavec Is

**Cannavec.ai** is a specialist cannabis knowledge platform and commercial API product. It sits at the intersection of two things Million Media does: building knowledge bases for natural remedies, and creating AI-powered tools that make those knowledge bases useful.

It is the commercial face of the **Cannabis Knowledge Foundation (CKF)** — an editorially governed, evidence-graded cannabis knowledge base built and maintained by Million Media / Plantz.io. The CKF owns the knowledge as a community asset; Cannavec.ai is the commercial licensing layer that makes it accessible.

**Cannavec's stated mission:** To be the industry hub for cannabis, from seed to sale to prescription. Evidence-based cannabis science, delivered as infrastructure.

**Parent company:** Million Media Ltd  
**Parent platform:** Plantz.io (WordPress) — the cannabis patient community platform  
**Domain:** cannavec.ai  
**Hosting:** Vercel (auto-deploy from GitHub)  
**GitHub:** MillionMedia2/cannavec

---

## How It Fits Into the Ecosystem

Million Media builds an interconnected ecosystem of AI knowledge products covering cannabis and natural remedies. Cannavec.ai is the cannabis-specific pillar:

```
MILLION MEDIA ECOSYSTEM
│
├── PLANTZ.IO — parent brand, patient community, WordPress hub
│
├── CANNAVEC.AI — cannabis knowledge platform (this project)
│   ├── Knowledge: Cannabis Knowledge Foundation (CKF)
│   ├── Data: Pinecone (plantz1 index, cannabis + cannabis_products namespaces)
│   └── Commercial layer: subscriptions, API keys, enterprise contracts
│
├── HERBIE — natural remedies agent on Plantz.io
│   └── Knowledge: Herb monographs (plantz1 index, natural_remedies namespace)
│
└── MC HUB — medical cannabis patient hub on Plantz.io
    └── Feeds from CKF knowledge base
```

Cannavec.ai and Herbie share the same Pinecone index (`plantz1`) and the same evidence framework (Level A/B/C grading). They are separate products but built on the same infrastructure.

---

## The Knowledge Base

The knowledge base lives in Pinecone (`plantz1` index) and is sourced from:

- **Knowledge source files:** `/Users/neilcartwright/test/Claude/knowledge/cannabis/mc-knowledge-base/cannabis/`
- **Airtable:** Primary data source for KB Registry, FAQ Registry, Products
- **Sanity CMS:** Being integrated as the headless CMS layer
- **Pipeline:** Markdown source files → CDAL compiler → Sanity CMS → Pinecone

### The CDAL Pipeline — Why It Matters for Cannavec

What Cannavec returns in the API response is entirely determined by what is in Pinecone. What is in Pinecone is entirely determined by how the Cannabis Knowledge Base articles are authored and compiled. This is the chain:

```
KB Article (markdown)
  ↓ YAML frontmatter → document-level metadata on every vector
  ↓ H2 headings → one Pinecone vector per H2 section
  ↓ ISO code in H2 heading → section-level jurisdiction filter
  ↓ evidence_grade in YAML → evidence_grade in API response metadata
  ↓ question_groups in YAML → retrieval pattern matching
```

**CDAL** (Cannabis Document Authoring Language) is the compiler that transforms KB markdown articles into Pinecone vector records. It:
- Splits each article at `##` H2 boundaries — one section = one Pinecone vector
- Extracts the ISO country code from H2 headings (e.g., `## Germany (DE) — ...`) and sets it as section-level jurisdiction metadata — enabling country-filtered retrieval
- Propagates YAML metadata (`evidence_grade`, `domain_layer`, `audience`, `question_groups`) to every vector from the document
- Derives question patterns and attaches them to sections post-compilation

**The practical consequence for Cannavec:** The `evidence_grade` field in the API response (`"evidence_grade": "Level A"`) comes from the YAML frontmatter of the KB article that produced the matched vector. If the article is authored correctly with an accurate evidence grade, Cannavec returns accurate evidence grade metadata. If articles are poorly structured with oversized sections, retrieval precision suffers across the Cannavec API.

Anyone working on Cannavec's API response quality should understand that improvements require KB authoring changes, not API changes. The pipeline is: better KB authoring → better CDAL compilation → better Pinecone vectors → better Cannavec API responses.

**KB article authoring standard:** `cannabis/00_meta_layer/cannabis-authoring-standard.md` (v2.6)
**CDAL compilation rules:** `scripts/sanity-cms/docs/cdal-compilation-rules.md` (v3.0)

### Pinecone namespaces and content

| Namespace | Content | Status |
|---|---|---|
| `cannabis` | Cannabinoid mechanisms, clinical evidence, dosing, drug interactions, safety, regulation | Active, growing |
| `cannabis_products` | UK/EU cannabis products, formulations, terpene profiles, cannabinoid content | Active, growing |

Records use evergreen language (no hardcoded counts) because the knowledge base is continuously growing.

**Evidence grading system:**
- **Level A** — RCTs, systematic reviews, meta-analyses
- **Level B** — Observational studies, cohort studies, clinical registries
- **Level C** — Expert opinion, case reports, traditional use, preclinical studies

**Editorial governance:** The Cannabis Knowledge Foundation editorial board — named individuals including patient advocates, clinicians and researchers — approves canonical content. No commercial influence on knowledge content. This is a constitutional principle.

**Editorial Board:**
- Chris Hobday — Head of Ops, UPA; instrumental in 2018 UK medical cannabis law changes
- Alt Spoonie — Patient advocate, cannabis educator, 4yr MC patient
- Medcannadiaries — Independent reviewer, criminology student, 17yr cannabis knowledge
- Yasha Khan — Entrepreneur, data scientist, 9yr cannabis industry
- MV (Duma) — Patient scientist, fibromyalgia, consumption research

---

## What Cannavec Offers (Product Vision)

### 1. Free Account — Chatbot Access
Users can register for a free account and access a chatbot interface powered by the cannabis knowledge base. This is the entry point into the Cannavec ecosystem.

### 2. API + MCP Access — £50/month (Individual)
Developers and individual users who want programmatic access to the knowledge base. Includes the REST API and MCP endpoint.

### 3. Company API Access — £500/month
For organisations. Additional per-user charges may apply.

### 4. Enterprise — "Talk To Us"
Full integration, custom interfaces, white-labelling, co-branding, named account manager, SLA, quarterly knowledge reviews. Pricing by negotiation — no figure published.

### 5. Skills (Planned)
**This is a key differentiator.** Cannavec will offer a suite of Skills — task-specific interfaces built on top of the knowledge base. Unlike generic AI tools, these are controlled, purpose-built workflows designed for cannabis industry use cases.

**Example Skill: Article Generator**
- Drop-down menus and checkboxes to specify: article type, target audience, evidence level, condition focus, tone
- The Agent uses these inputs to generate a compliant, cited cannabis article in seconds
- No prompt engineering required from the user

**Key principle:** Skills inside cannavec.ai are rich, interface-driven, and optimised for speed and ease. The same Skills are also available via MCP for developers, but in a simpler, parameter-based form. The web interface is the premium experience.

**Planned Skills (initial ideas — to be expanded):**
- Article Generator
- Patient Information Sheet Generator
- Product Description Writer
- Regulatory Summary (by jurisdiction)
- Drug Interaction Checker
- Clinical Protocol Builder

---

## Current Pricing Tiers

| Tier | Price | API Calls/Month | Rate Limit |
|---|---|---|---|
| Free | £0 | 5 demo queries/day | 1/min |
| Individual | £50/month | TBD | TBD |
| Company | £500/month | TBD | TBD |
| Enterprise | Contact Us | Unlimited | 100/min |

> **Note:** The pricing page currently shows legacy tiers (Advocacy/Startup/Professional/Enterprise) that need to be updated to reflect the new Free/Individual/Company/Enterprise model. This is a pending task.

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom CSS variables |
| Fonts | DM Serif Display (headings), DM Sans (body), JetBrains Mono (code) |
| Payments | Stripe (live keys) |
| Knowledge Base | Pinecone vector store (integrated inference via llama-text-embed-v2) |
| Hosting | Vercel |
| Database | Supabase (api_keys table — api key verification) |

**Brand identity:** Deep green `#1B5E20` (cannavec-500). Scientific authority, medical/clinical aesthetic. No leaf imagery. No lifestyle cannabis branding.

---

## Codebase Structure

```
/scripts/cannavec/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout, nav, footer
│   ├── globals.css                 # Brand styles + Tailwind
│   ├── pricing/page.tsx            # Pricing tiers
│   ├── about/page.tsx              # CKF, editorial board, governance
│   ├── docs/page.tsx               # API documentation
│   ├── contact/page.tsx            # Contact + enterprise enquiries
│   └── api/v1/search/route.ts      # ⭐ Main API route → Pinecone
├── components/
│   ├── hero-section.tsx            # Hero + event badge
│   ├── demo-section.tsx            # Live demo (real Pinecone queries)
│   ├── value-prop-section.tsx
│   ├── build-vs-buy-section.tsx
│   ├── trusted-by-section.tsx
│   ├── cta-section.tsx
│   ├── navigation.tsx
│   └── footer.tsx
├── lib/
│   ├── api-keys.ts                 # Key verification via Supabase
│   ├── tiers.ts                    # Tier permissions + namespace access
│   └── supabase/admin.ts           # Supabase admin client
├── .env.local                      # Live credentials (never commit)
├── .env.local.example              # Template
├── CURSOR_CONTEXT.md               # Legacy context (superseded by this file)
└── README.md                       # Quick start
```

---

## API Architecture

**Endpoint:** `POST /api/v1/search`

**Flow:**
1. Client sends `{ query, namespace, top_k, include_metadata }` with Bearer token
2. Route validates Bearer token:
   - `demo_public_key` → accepted for public demo (rate-limited client-side, 5/day)
   - All other keys → verified via `lib/api-keys.ts` against Supabase
3. Tier determined → namespace access checked via `lib/tiers.ts`
4. Query proxied to Pinecone integrated inference endpoint
5. Results formatted with evidence grades extracted from metadata
6. `last_used_at` updated on the API key record (fire-and-forget)

**Pinecone host:** `plantz1-aokppsg.svc.gcp-europe-west4-de1d.pinecone.io`

**Response shape:**
```json
{
  "results": [
    {
      "id": "record_id",
      "score": 0.94,
      "metadata": {
        "topic": "...",
        "finding": "...",
        "evidence_grade": "Level A",
        "authority_score": 9,
        "clinical_relevance": "...",
        "sources": "..."
      }
    }
  ],
  "meta": {
    "response_time_ms": 142,
    "namespace": "cannabis",
    "query_length": 32,
    "results_returned": 5,
    "evidence_grades": { "Level A": 3, "Level B": 2 }
  }
}
```

---

## Demo (Public-Facing)

- Live at the homepage (`#demo` section)
- Calls the real `/api/v1/search` endpoint with `demo_public_key`
- Rate-limited client-side via localStorage: 5 queries per calendar day
- Counter displayed live ("3 remaining today")
- Input and buttons disable when limit reached
- Custom free-text queries work (not just the example buttons)

---

## Environment Variables

Stored in `/scripts/cannavec/.env.local` (never commit). Mirrored from master `.env` at `/Users/neilcartwright/test/Claude/.env`.

| Variable | Value/Source |
|---|---|
| `PINECONE_API_KEY` | From master .env |
| `PINECONE_INDEX` | `plantz1` |
| `PINECONE_HOST` | `plantz1-aokppsg.svc.gcp-europe-west4-de1d.pinecone.io` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From master .env |
| `STRIPE_SECRET_KEY` | From master .env |
| `NEXT_PUBLIC_APP_URL` | `https://cannavec.ai` (or `http://localhost:3000` for dev) |

---

## Outstanding TODOs

- [ ] **Pricing page:** Update tiers to match new model (Free/£50/£500/Enterprise)
- [ ] **Auth:** Stripe webhook to create Supabase user + generate API key on subscription
- [ ] **Auth:** Full API key validation against Supabase (partial implementation exists)
- [ ] **Rate limiting:** Server-side rate limiting middleware (currently demo only has client-side)
- [ ] **Usage tracking:** Per-key usage counters for billing enforcement
- [ ] **Free account:** Build registration flow + chatbot interface for free tier
- [ ] **Skills:** Design and build first Skills (Article Generator as v1)
- [ ] **MCP endpoint:** Expose knowledge base as MCP server (parallel to REST API)
- [ ] **README:** Update to reflect new pricing model

---

## Deployment

**Local dev:**
```bash
cd /Users/neilcartwright/test/Claude/scripts/cannavec
npm run dev
# → http://localhost:3000
```

**Production:** Push to GitHub → Vercel auto-deploys from `main` branch.

**Vercel env vars:** Must be set in Vercel dashboard (not committed to repo). Match `.env.local` minus `NEXT_PUBLIC_APP_URL` (set to `https://cannavec.ai`).

**DNS (123-reg.com):**
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

---

## Session Log

| Date | Change |
|---|---|
| 2026-02-18 | Initial build. Demo section example buttons bug fixed. Hardcoded record counts removed across site. |
| 2026-03-05 | Event badge updated: Cannabis Europa Paris → ICBC Berlin April 2026. Enterprise pricing: £10,000 → "Contact Us" (all pages). Demo wired to real Pinecone queries. Client-side rate limiting (5/day) implemented. `.env.local` created from master. |
| 2026-05-02 | Added CDAL Pipeline section explaining the KB→CDAL→Pinecone→API chain and why KB authoring quality directly determines Cannavec API response quality. |

---

*This file is maintained by Claude. Update the Session Log and Outstanding TODOs at the end of every session that changes Cannavec.*
