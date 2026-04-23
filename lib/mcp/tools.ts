import { getAllowedNamespaces, isNamespaceAllowed } from "@/lib/tiers";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST || "";
const VALID_NAMESPACE_PATTERN = /^[a-z0-9_]{1,64}$/;

export const TOOLS = [
  {
    name: "search_cannabis_kb",
    description:
      "Search the Cannavec Cannabis Knowledge Base. Returns semantically relevant passages from peer-reviewed research, regulatory documents, and cannabis product data. Use this for any cannabis-related question requiring evidence-based information.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query — a question or keyword phrase",
        },
        namespace: {
          type: "string",
          description:
            "Knowledge base to search. Defaults to 'cannabis'. Options depend on your tier: free/advocacy get 'cannabis' and 'cannabis_faq'; startup+ also get 'cannabis_products'; professional/enterprise also get 'natural_remedies'.",
          default: "cannabis",
        },
        top_k: {
          type: "number",
          description: "Number of results to return (1–10). Defaults to 5.",
          default: 5,
        },
      },
      required: ["query"],
    },
  },
];

export async function callSearchCannabisKb(
  args: { query: string; namespace?: string; top_k?: number },
  tier: string
): Promise<string> {
  const namespace = args.namespace ?? "cannabis";
  const top_k = Math.min(Math.max(args.top_k ?? 5, 1), 10);

  if (!VALID_NAMESPACE_PATTERN.test(namespace)) {
    throw new Error(`Invalid namespace: "${namespace}"`);
  }

  if (!isNamespaceAllowed(tier, namespace)) {
    const allowed = getAllowedNamespaces(tier).join(", ");
    throw new Error(
      `Your tier (${tier}) does not have access to namespace "${namespace}". Allowed: ${allowed}. Upgrade at https://cannavec.ai/pricing`
    );
  }

  const response = await fetch(
    `https://${PINECONE_HOST}/records/namespaces/${namespace}/search`,
    {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": "2025-01",
      },
      body: JSON.stringify({
        query: { inputs: { text: args.query }, top_k },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Knowledge base query failed");
  }

  const data = await response.json();
  const hits: any[] = data.result?.hits ?? [];

  if (hits.length === 0) {
    return "No results found for your query.";
  }

  const lines = hits.map((hit, i) => {
    const fields = hit.fields ?? {};
    const score = Math.round(hit._score * 100) / 100;
    const title = fields.title ?? fields.source ?? hit._id;
    const text = fields.text ?? fields.content ?? "";
    const grade = fields.evidence_grade ? ` [${fields.evidence_grade}]` : "";
    return `${i + 1}. **${title}**${grade} (score: ${score})\n${text}`;
  });

  return lines.join("\n\n");
}
