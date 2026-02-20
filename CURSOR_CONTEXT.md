# Cannavec.ai — Project Context for Cursor

> **Last updated:** 2026-02-18

## What This Is

**Cannavec.ai** is the commercial API service for the **Cannabis Knowledge Foundation (CKF)** — an editorially governed, evidence-based cannabis knowledge base. It provides verified cannabis science via API to clinics, tech platforms, brands and researchers.

**Parent project:** Plantz.io (cannabis patient community and tooling platform)
**Launch date:** February 19, 2026 at Cannabis Europa Paris
**Media partner:** Newsweed.fr

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + custom components (DM Serif Display / DM Sans fonts)
- **Payments:** Stripe (keys in .env.local)
- **Knowledge Base:** Pinecone vector store (index: `plantz1`, namespaces: `cannabis` (hundreds of records, growing), `cannabis_products` (hundreds of records, growing))
- **Hosting:** Vercel (deploy from this repo)
- **Domain:** cannavec.ai

## Key Files

```
app/
├── page.tsx                    # Homepage (hero, demo, value props, CTA)
├── layout.tsx                  # Root layout with nav + footer
├── globals.css                 # Tailwind + brand styles
├── pricing/page.tsx            # 4-tier pricing (Advocacy £10 → Enterprise £10K)
├── about/page.tsx              # Foundation info + editorial board
├── docs/page.tsx               # API documentation
├── demo/page.tsx               # Interactive demo
├── contact/page.tsx            # Contact / enterprise enquiries
├── api/v1/search/route.ts      # ⭐ MAIN API ROUTE — proxies to Pinecone
components/
├── navigation.tsx
├── hero-section.tsx
├── demo-section.tsx            # Interactive terminal-style demo
├── value-prop-section.tsx
├── build-vs-buy-section.tsx    # Build in-house vs Cannavec comparison
├── trusted-by-section.tsx      # Use cases by audience
├── cta-section.tsx
├── footer.tsx
```

## Brand & Design

- **Primary colour:** Deep green `#1B5E20` (cannavec-500)
- **Accent:** Emerald `#10b981`
- **Fonts:** DM Serif Display (headings), DM Sans (body), JetBrains Mono (code)
- **Aesthetic:** Scientific authority, medical/clinical feel — NOT lifestyle cannabis branding. No leaf imagery.
- **Tone:** Professional, evidence-first, but accessible

## Deployment Instructions

1. Push this repo to GitHub (`MillionMedia2/cannavec`)
2. Connect to Vercel (import from GitHub)
3. Add environment variables in Vercel dashboard:
   - `PINECONE_API_KEY` — from .env
   - `PINECONE_INDEX` — `plantz1`
   - `PINECONE_HOST` — get from Pinecone dashboard (index host URL)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` — `https://cannavec.ai`
4. Set custom domain to `cannavec.ai` in Vercel
5. Point DNS from 123-reg.com:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`

## API Architecture

The search API route (`app/api/v1/search/route.ts`) is the core backend:
1. Receives POST with `query`, `namespace`, `top_k`
2. Authenticates via Bearer token
3. Proxies to Pinecone's integrated inference endpoint
4. Returns formatted results with evidence grades and metadata

**TODO items in codebase:**
- [ ] API key validation against database (currently accepts any key)
- [ ] Stripe webhook to create user records + generate API keys on subscription
- [ ] Usage tracking per API key per billing period
- [ ] Rate limiting middleware
- [ ] PINECONE_HOST needs to be set (get from Pinecone dashboard)

## Pricing Tiers

| Tier | Price | Monthly Calls | Rate/min |
|------|-------|--------------|----------|
| Enterprise | £10,000/mo | Unlimited | 100 |
| Professional | £3,000/mo | 50,000 | 60 |
| Startup | £750/mo | 10,000 | 30 |
| Advocacy | £10-100/mo | 5,000 | 10 |

## Editorial Board (displayed on /about)

- **Chris Hobday** — Head of Ops, UPA. First UK patient prescribed CBPMs.
- **Alt Spoonie** — Patient advocate, cannabis educator, 4yr MC patient.
- **Medcannadiaries** — Independent reviewer, criminology student, 17yr knowledge.
- **Yasha Khan** — Entrepreneur, data scientist, 9yr cannabis industry.
- **MV (Duma)** — Patient scientist, fibromyalgia, consumption research.

## Connected Services

- **Pinecone index `plantz1`** — the knowledge base
- **Stripe** — payment processing (live keys)
- **GitHub** — MillionMedia2 organisation
- **Vercel** — hosting and deployment
- **Plantz.io** — parent WordPress site

## Change Log

### 2026-02-18
- **Fixed:** Demo section example query buttons now correctly return distinct responses per query (was falling back to first query response for all buttons due to key matching issue)
- **Changed:** Replaced all hardcoded record counts (792, 809, 1,601) across the site with generic descriptions ("hundreds of", "thousands of") to prevent the site dating as the knowledge base grows. Affected files: hero-section.tsx, build-vs-buy-section.tsx, demo/page.tsx, docs/page.tsx, pricing/page.tsx
- **Changed:** Removed `records_searched` field from API docs example response to avoid hardcoded numbers

## Important Notes

- The `herb_monographs` namespace (thousands of records) is NOT part of Cannavec — it's a separate Plantz product
- All content uses compliance-safe language ("research suggests", "may support")
- Evidence grading: Level A (RCTs), Level B (observational), Level C (expert opinion)
- Constitutional principle: no commercial influence on knowledge content
