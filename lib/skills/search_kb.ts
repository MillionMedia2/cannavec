import { getAllowedNamespaces, isNamespaceAllowed } from "@/lib/tiers";
import { searchNamespace, formatKbHits } from "./pinecone";
import { Skill } from "./types";

const VALID_NAMESPACE = /^[a-z0-9_]{1,64}$/;

export const searchKb: Skill = {
  id: "search_cannabis_kb",
  name: "Cannabis Knowledge Base Search",
  description:
    "Semantic search across peer-reviewed research, regulatory documents, and clinical guidance in the CKF Cannabis Knowledge Base. Returns evidence-graded results. Use this for any cannabis-related question requiring evidence-based information. Always use this to provide the full evidence base — even when search_faq has already been called for grounding, this tool is required to give a complete, substantive answer.",
  minTier: "free",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
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
  async handler(input, context) {
    const namespace = (input.namespace as string | undefined) ?? "cannabis";
    const top_k = Math.min(Math.max((input.top_k as number | undefined) ?? 5, 1), 10);

    if (!VALID_NAMESPACE.test(namespace)) {
      throw new Error(`Invalid namespace: "${namespace}"`);
    }

    if (!isNamespaceAllowed(context.tier, namespace)) {
      const allowed = getAllowedNamespaces(context.tier).join(", ");
      throw new Error(
        `Your tier (${context.tier}) does not have access to namespace "${namespace}". Allowed: ${allowed}. Upgrade at https://cannavec.ai/pricing`
      );
    }

    const hits = await searchNamespace(input.query as string, namespace, top_k);
    const text = formatKbHits(hits);

    return {
      text,
      structuredContent: { namespace, hits_returned: hits.length },
    };
  },
};
