import { getAllowedNamespaces, isNamespaceAllowed } from "@/lib/tiers";
import { searchNamespace, formatKbHits, formatFaqHits } from "./pinecone";
import { Skill } from "./types";

const VALID_NAMESPACE = /^[a-z0-9_]{1,64}$/;
const FAQ_THRESHOLD = 0.5;

export const searchKb: Skill = {
  id: "search_cannabis_kb",
  name: "Cannabis Knowledge Base Search",
  description:
    "Search the Cannabis Knowledge Base. Always checks the FAQ (cannabis_faq namespace) first — if a relevant FAQ entry is found it is used to ground and frame the answer. The full knowledge base (cannabis namespace) is always queried to provide evidence, clinical detail, and additional content. Use this skill for any cannabis-related question. Never call a separate FAQ skill — FAQ and KB are always used in tandem through this single skill.",
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
        description: "The question or keyword phrase to search for",
      },
      top_k: {
        type: "number",
        description: "Number of KB results to return (1–10). Defaults to 5.",
        default: 5,
      },
    },
    required: ["query"],
  },
  async handler(input, context) {
    const query = input.query as string;
    const top_k = Math.min(Math.max((input.top_k as number | undefined) ?? 5, 1), 10);

    if (!isNamespaceAllowed(context.tier, "cannabis")) {
      const allowed = getAllowedNamespaces(context.tier).join(", ");
      throw new Error(
        `Your tier (${context.tier}) does not have access to the cannabis namespace. Allowed: ${allowed}. Upgrade at https://cannavec.ai/pricing`
      );
    }

    // Always query both in parallel
    const [faqHits, kbHits] = await Promise.all([
      searchNamespace(query, "cannabis_faq", 1),
      searchNamespace(query, "cannabis", top_k),
    ]);

    const parts: string[] = [];

    // FAQ grounds the answer if a confident match exists
    if (faqHits.length > 0 && faqHits[0]._score >= FAQ_THRESHOLD) {
      parts.push(
        "--- FAQ (use to frame and ground your answer) ---\n" +
        formatFaqHits(faqHits) +
        "\n-------------------------------------------------"
      );
    }

    // KB always provides the full evidence base
    if (kbHits.length > 0) {
      parts.push(
        "--- KNOWLEDGE BASE (use for evidence, clinical detail, and full answer) ---\n" +
        formatKbHits(kbHits) +
        "\n--------------------------------------------------------------------------"
      );
    }

    const text = parts.length > 0
      ? parts.join("\n\n")
      : "No results found for your query.";

    return {
      text,
      structuredContent: {
        faq_hits: faqHits.length,
        kb_hits: kbHits.length,
        faq_grounding_used: faqHits.length > 0 && faqHits[0]._score >= FAQ_THRESHOLD,
      },
    };
  },
};
