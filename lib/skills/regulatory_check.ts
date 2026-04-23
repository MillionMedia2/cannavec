import { searchNamespace, formatKbHits } from "./pinecone";
import { Skill } from "./types";

export const regulatoryCheck: Skill = {
  id: "regulatory_check",
  name: "Regulatory Overview",
  description:
    "Retrieve jurisdiction-specific regulatory status for cannabis and cannabinoid products. Returns the current legal framework, scheduling, and prescribing rules for a given country. Provide a jurisdiction code (e.g. GB, DE, NL, AU) for targeted results.",
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
        description:
          "The regulatory topic or question, e.g. 'medical cannabis prescribing rules' or 'CBD scheduling'",
      },
      jurisdiction: {
        type: "string",
        description:
          "ISO 3166-1 alpha-2 country code to focus results on a specific jurisdiction, e.g. 'GB', 'DE', 'NL', 'AU', 'CA'. Omit for general results.",
      },
    },
    required: ["query"],
  },
  async handler(input) {
    const query = input.query as string;
    const jurisdiction = input.jurisdiction as string | undefined;

    const enrichedQuery = jurisdiction
      ? `${query} ${jurisdiction} regulation legal framework`
      : query;

    const hits = await searchNamespace(enrichedQuery, "cannabis", 5);
    const text = formatKbHits(hits);

    return {
      text,
      structuredContent: {
        namespace: "cannabis",
        jurisdiction: jurisdiction ?? null,
        hits_returned: hits.length,
      },
    };
  },
};
