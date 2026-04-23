import { searchNamespace, formatFaqHits } from "./pinecone";
import { Skill } from "./types";

export const searchFaq: Skill = {
  id: "search_faq",
  name: "Search Cannabis FAQ",
  description:
    "Retrieve verified answers from the CKF FAQ database. Best for common patient and clinician questions with direct, evidence-backed answers. Use this when the user asks a frequently-asked question about cannabis.",
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
        description: "The question to search for in the FAQ database",
      },
      top_k: {
        type: "number",
        description: "Number of FAQ results to return (1–10). Defaults to 5.",
        default: 5,
      },
    },
    required: ["query"],
  },
  async handler(input) {
    const top_k = Math.min(Math.max((input.top_k as number | undefined) ?? 5, 1), 10);
    const hits = await searchNamespace(input.query as string, "cannabis_faq", top_k);
    const text = formatFaqHits(hits);

    return {
      text,
      structuredContent: { namespace: "cannabis_faq", hits_returned: hits.length },
    };
  },
};
