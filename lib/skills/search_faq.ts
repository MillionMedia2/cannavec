import { searchNamespace, formatFaqHits } from "./pinecone";
import { Skill } from "./types";

export const searchFaq: Skill = {
  id: "search_faq",
  name: "Search Cannabis FAQ",
  description:
    "Retrieve a verified FAQ entry to ground and frame your answer. Use this FIRST to get a concise, validated summary of the question — then ALWAYS follow up with search_cannabis_kb to retrieve the full evidence base. The FAQ answer alone is not sufficient; it is a starting point and framing guide, not a complete response. Never answer solely from FAQ results.",
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
        description: "Number of FAQ results to return (1–3 recommended — FAQ is for grounding, not exhaustive retrieval).",
        default: 1,
      },
    },
    required: ["query"],
  },
  async handler(input) {
    const top_k = Math.min(Math.max((input.top_k as number | undefined) ?? 1, 1), 10);
    const hits = await searchNamespace(input.query as string, "cannabis_faq", top_k);
    const text = formatFaqHits(hits);

    return {
      text,
      structuredContent: { namespace: "cannabis_faq", hits_returned: hits.length },
    };
  },
};
