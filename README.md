# Cannavec.ai

**Evidence-based cannabis knowledge as a service.**

The commercial API for the Cannabis Knowledge Foundation — delivering editorially governed, evidence-graded cannabis science to clinics, platforms, brands and researchers.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in your API keys
npm run dev
```

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Pinecone (vector store)
- Stripe (payments)
- Vercel (hosting)

## API

```bash
curl -X POST https://cannavec.ai/api/v1/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "CBD for anxiety", "namespace": "cannabis", "top_k": 5}'
```

## Knowledge Base

| Namespace | Records | Content |
|-----------|---------|---------|
| `cannabis` | 792 | Mechanisms, clinical evidence, dosing, safety, regulation |
| `cannabis_products` | 809 | UK/EU products, formulations, terpene profiles |

## Pricing

| Tier | Price |
|------|-------|
| Enterprise | £10,000/month |
| Professional | £3,000/month |
| Startup | £750/month |
| Advocacy | £10-£100/month |

## License

Proprietary. © Cannabis Knowledge Foundation.
