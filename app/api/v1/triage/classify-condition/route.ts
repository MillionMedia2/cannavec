// Triage Skill — Condition Classifier
// ------------------------------------
// Classifies a user-entered condition against the live Cannabis KB.
//
// Returns one of:
//   - "treatable"        → condition is one for which medical cannabis is commonly prescribed
//   - "contraindicated"  → condition is a contraindication (schizophrenia, active psychosis, etc.)
//   - "unknown"          → not enough KB evidence either way (verdict engine treats this as amber)
//
// Uses Pinecone for KB grounding + Claude Haiku for classification (cheap, fast).
//
// Unauthenticated by design — the Triage standalone /triage route is for plantz.io
// patient visitors who don't have a Cannavec login. The dashboard version uses the same
// endpoint. Light rate limiting prevents abuse.

import { NextRequest, NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { searchNamespace, formatKbHits, formatFaqHits } from "@/lib/skills/pinecone";
import { isExcludedCondition } from "@/lib/triage/conditions";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface ClassifyConditionRequest {
  condition: string;
}

export interface ClassifyConditionResponse {
  classification: "treatable" | "contraindicated" | "unknown";
  reason: string;
}

const CLASSIFIER_SYSTEM = `You are a triage classifier for a UK medical cannabis eligibility check.

Given a patient's stated condition and Knowledge Base extracts, classify the condition as exactly one of:
- "treatable"       — the KB shows medical cannabis is a treatment option for this condition
- "contraindicated" — the condition is a contraindication for cannabis (active psychosis, schizophrenia, bipolar in mania, cannabis use disorder, cannabinoid hyperemesis syndrome) OR the patient is pregnant/breastfeeding
- "unknown"         — the KB doesn't contain clear evidence either way

Be conservative with "treatable" — only use it when the KB clearly describes cannabis as a therapeutic option. If the KB only mentions a condition in passing or as a risk factor, return "unknown".

Respond with a single JSON object: {"classification": "...", "reason": "<one short sentence>"}.
No prose, no markdown, no code fences. JSON only.`;

const MAX_CONDITION_LENGTH = 200;

export async function POST(request: NextRequest) {
  let body: ClassifyConditionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conditionRaw = (body.condition || "").trim();
  if (!conditionRaw) {
    return NextResponse.json({ error: "condition is required" }, { status: 400 });
  }
  if (conditionRaw.length > MAX_CONDITION_LENGTH) {
    return NextResponse.json(
      { error: `condition must be ${MAX_CONDITION_LENGTH} characters or fewer` },
      { status: 400 },
    );
  }

  // Short-circuit: explicitly excluded conditions don't need a Pinecone call.
  if (isExcludedCondition(conditionRaw)) {
    const response: ClassifyConditionResponse = {
      classification: "contraindicated",
      reason:
        "This condition is a known contraindication for medical cannabis or is otherwise not appropriate for treatment.",
    };
    return NextResponse.json(response);
  }

  try {
    // Pinecone retrieval — FAQ + KB in parallel, mirroring the chatbot pattern.
    const [faqHits, kbHits] = await Promise.all([
      searchNamespace(conditionRaw, "cannabis_faq", 2),
      searchNamespace(conditionRaw, "cannabis", 5),
    ]);

    const contextParts: string[] = [];
    if (faqHits.length > 0) {
      contextParts.push(
        "--- FAQ context ---\n" + formatFaqHits(faqHits) + "\n-------------------",
      );
    }
    if (kbHits.length > 0) {
      contextParts.push(
        "--- KB context ---\n" + formatKbHits(kbHits) + "\n------------------",
      );
    }

    if (contextParts.length === 0) {
      // Nothing in the KB at all → unknown
      const response: ClassifyConditionResponse = {
        classification: "unknown",
        reason: "No relevant entries found in the Knowledge Base for this condition.",
      };
      return NextResponse.json(response);
    }

    const userMessage = `Patient stated condition: "${conditionRaw}"

Knowledge Base extracts:

${contextParts.join("\n\n")}

Classify the condition.`;

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system: CLASSIFIER_SYSTEM,
      prompt: userMessage,
      maxOutputTokens: 200,
      temperature: 0,
    });

    // Parse the model's JSON response. Be tolerant of leading/trailing whitespace.
    const parsed = parseClassifierResponse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[triage/classify-condition] error:", err);
    // Fail open to "unknown" — verdict engine treats this as amber, which is safer
    // than blocking a real patient because of a transient backend hiccup.
    const response: ClassifyConditionResponse = {
      classification: "unknown",
      reason: "Could not classify the condition at this time. A clinician will assess.",
    };
    return NextResponse.json(response);
  }
}

function parseClassifierResponse(text: string): ClassifyConditionResponse {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const cls = obj.classification;
    if (cls === "treatable" || cls === "contraindicated" || cls === "unknown") {
      return {
        classification: cls,
        reason: typeof obj.reason === "string" ? obj.reason : "",
      };
    }
  } catch {
    /* fall through */
  }
  return {
    classification: "unknown",
    reason: "Classifier returned an unexpected response — defaulting to unknown.",
  };
}
