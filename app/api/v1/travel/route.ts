// Travel Skill API — TS-4: Pinecone multi-query retrieval + Claude synthesis.

import { NextRequest, NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import type { TravelMethod, Duration } from "@/lib/travel-risk";
import { getCountry, assessRouteRisk, assessTransitHub } from "@/lib/travel-risk";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;

export interface TravelRequest {
  origin: string;
  destination: string;
  travelMethod: TravelMethod;
  duration: Duration;
  transitHub?: string;
}

export interface TravelSection {
  id: string;
  level?: "green" | "amber" | "red" | "warning";
  heading: string;
  body: string;
}

export interface TravelResponse {
  assessment: "green" | "amber" | "red";
  assessmentLabel: string;
  sections: TravelSection[];
  verifiedAsOf: string;
  disclaimer: string;
}

// ─── Pinecone helper ───────────────────────────────────────────────────────────

async function pineconeSearch(
  query: string,
  filter?: Record<string, unknown>,
  topK = 5
): Promise<Array<{ id: string; score: number; metadata: Record<string, unknown> }>> {
  const body: Record<string, unknown> = {
    query: { inputs: { text: query }, top_k: topK },
  };
  if (filter) {
    (body.query as Record<string, unknown>).filter = filter;
  }

  const res = await fetch(
    `https://${PINECONE_HOST}/records/namespaces/cannabis/search`,
    {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": "2025-01",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    console.error("Pinecone error:", await res.text());
    return [];
  }

  const data = await res.json();
  return (data.result?.hits || []).map((hit: Record<string, unknown>) => ({
    id: hit._id as string,
    score: Math.round((hit._score as number) * 100) / 100,
    metadata: (hit.fields as Record<string, unknown>) || {},
  }));
}

// ─── Context builder ───────────────────────────────────────────────────────────

function buildContext(
  results: Array<{ id: string; score: number; metadata: Record<string, unknown> }>
): string {
  return results
    .map((r, i) => {
      const m = r.metadata;
      const title = (m.title || m.source || r.id) as string;
      const section = m.sectionHeading ? ` — ${m.sectionHeading}` : "";
      const grade = m.evidence_grade ? ` [${m.evidence_grade}]` : "";
      const jur = m.jurisdiction ? ` (${m.jurisdiction})` : "";
      const text = (m.text || m.content || m.finding || "") as string;
      return `--- SOURCE ${i + 1}: ${title}${section}${grade}${jur} ---\n${text}\n---`;
    })
    .join("\n\n");
}

// ─── Merge + deduplicate ───────────────────────────────────────────────────────

function mergeResults(
  ...batches: Array<Array<{ id: string; score: number; metadata: Record<string, unknown> }>>
) {
  const seen = new Set<string>();
  const merged: Array<{ id: string; score: number; metadata: Record<string, unknown> }> = [];
  for (const batch of batches) {
    for (const item of batch) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }
  return merged.sort((a, b) => b.score - a.score);
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: TravelRequest = await request.json();
    const { origin, destination, travelMethod, duration, transitHub } = body;

    // Auth + logging
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;

    // Log the query (fire-and-forget — don't block the response)
    supabase
      .from("travel_query_log")
      .insert({
        user_id: userId,
        origin,
        destination,
        travel_method: travelMethod,
        duration,
        transit_hub: transitHub || null,
        queried_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error("Travel log insert error:", error.message);
      });

    if (!origin || !destination || !travelMethod || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, travelMethod, duration" },
        { status: 400 }
      );
    }

    const originCountry = getCountry(origin);
    const destCountry = getCountry(destination);

    if (!originCountry || !destCountry) {
      return NextResponse.json(
        { error: "Unknown origin or destination country code" },
        { status: 400 }
      );
    }

    // Route risk assessment (deterministic lookup table)
    const routeRisk = assessRouteRisk(origin, destination, travelMethod);
    const transitHubRisk = transitHub ? assessTransitHub(transitHub) : null;

    // Determine overall assessment colour
    const isHighRiskTransit =
      transitHubRisk !== null &&
      transitHub !== "DIRECT" &&
      routeRisk.level !== "high"; // if already red from destination, don't downgrade
    const assessment: TravelResponse["assessment"] =
      routeRisk.level === "high"
        ? "red"
        : isHighRiskTransit
        ? "red"
        : routeRisk.level === "conditional"
        ? "amber"
        : "green";

    // Duration label for the prompt
    const durationLabel =
      duration === "up_to_7"
        ? "up to 7 days"
        : duration === "8_to_30"
        ? "8–30 days"
        : "over 30 days";

    const transitLabel =
      transitHub && transitHub !== "DIRECT"
        ? transitHub
        : "none (direct or not flying)";

    // ── Pinecone queries (parallel) ────────────────────────────────────────────

    const isSchengenRelevant =
      originCountry.isoSchengen || destCountry.isoSchengen;
    const isHighRiskDestination = routeRisk.warningType === "destination_only";

    const [q1, q2, q3, q4, q5] = await Promise.all([
      // Q1: origin outbound rules
      pineconeSearch(
        `medical cannabis travel outbound rules patients leaving ${originCountry.name} prescription documentation`,
        { jurisdiction: { $eq: origin } },
        5
      ),
      // Q2: destination inbound requirements
      pineconeSearch(
        `medical cannabis import rules entering ${destCountry.name} prescription requirements`,
        { jurisdiction: { $in: [destination, "GLOBAL"] } },
        5
      ),
      // Q3: Schengen mechanism (only if relevant)
      isSchengenRelevant
        ? pineconeSearch(
            "Schengen area medical cannabis cross-border travel rules",
            { jurisdiction: { $eq: "SCHENGEN" } },
            3
          )
        : Promise.resolve([]),
      // Q4: Transit risk and high-risk country warnings
      pineconeSearch(
        `high risk cannabis transit ${transitLabel} zero tolerance countries warnings`,
        { jurisdiction: { $eq: "GLOBAL" } },
        5
      ),
      // Q5: Travel documentation
      pineconeSearch(
        `travel documentation required cannabis ${originCountry.name} ${destCountry.name} prescription certificate`,
        { jurisdiction: { $in: [origin, destination, "GLOBAL"] } },
        5
      ),
    ]);

    const allResults = mergeResults(q1, q2, q3, q4, q5);
    const context = buildContext(allResults.slice(0, 12));

    // ── Claude synthesis ───────────────────────────────────────────────────────

    const systemPrompt = `You are the Cannavec Cannabis Travel Planner.

You help medical cannabis patients understand whether they can travel with their prescribed medicine, and exactly what they need to do.

You are talking directly to a patient. Write in plain English. No jargon. No passive voice. Use "you" throughout. Be warm and direct.

You are not a lawyer. Do not give legal advice. Give regulatory information based on verified primary sources, always with the date it was last verified.

The patient is travelling:
  FROM: ${originCountry.name} (${origin})
  TO: ${destCountry.name} (${destination})
  BY: ${travelMethod === "flying" ? "Flying" : travelMethod === "driving" ? "Driving" : "Train or ferry"}
  FOR: ${durationLabel}
  TRANSIT HUB: ${transitLabel}

ROUTE RISK ASSESSMENT (from routing table — incorporate this):
  Risk level: ${routeRisk.level}
  Warning type: ${routeRisk.warningType}
  Message: ${routeRisk.message || "None"}
  ${isHighRiskDestination ? "This is a DO NOT CARRY destination. Make this very clear." : ""}
  ${isHighRiskTransit ? `Transit through ${transitHubRisk?.city}, ${transitHubRisk?.country} is extremely dangerous — zero tolerance. This must be section 1 of the output.` : ""}

RESPOND WITH VALID JSON ONLY. No prose, no markdown, no code fences. The JSON must follow this exact structure:

{
  "assessment": "green" | "amber" | "red",
  "assessmentLabel": "One clear sentence about whether travel is possible",
  "verifiedAsOf": "YYYY-MM-DD date from the most recent source in the retrieved context, or today if unclear",
  "sections": [
    {
      "id": "transit_warning",
      "level": "warning",
      "heading": "Transit Warning — [Hub City, Country]",
      "body": "Plain text body. No markdown."
    },
    {
      "id": "documents",
      "heading": "Documents You Need",
      "body": "Plain text body. Use numbered or bulleted lists with newlines."
    },
    {
      "id": "before_you_go",
      "heading": "Before You Go",
      "body": "Numbered steps separated by newlines."
    },
    {
      "id": "if_stopped",
      "heading": "If You're Stopped",
      "body": "Short and practical."
    },
    {
      "id": "when_you_arrive",
      "heading": "When You Get There",
      "body": "Brief destination-specific notes."
    }
  ]
}

RULES:
- Only include the transit_warning section if the transit hub is flagged as high-risk.
- The assessmentLabel must use EXACTLY one of:
  * "You can travel to [destination] with your cannabis with the right documentation."
  * "Travelling to [destination] with cannabis requires advance planning. Read carefully."
  * "Do not travel to [destination] with cannabis. Your prescription provides no legal protection there."
- NEVER recommend carrying cannabis somewhere it is illegal or dangerous.
- NEVER invent regulatory requirements not in the knowledge base.
- If the evidence is uncertain, say so.
- The assessment field must match the assessmentLabel (green=can travel, amber=requires planning, red=do not travel).`;

    const userMessage = `Using the knowledge base sources below, generate travel guidance for a patient travelling from ${originCountry.name} to ${destCountry.name}.

${context || "No specific knowledge base entries were retrieved for this route. Use the route risk assessment and general travel guidance principles."}`;

    let claudeResponse: string;
    try {
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-6"),
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        maxTokens: 4000,
        temperature: 0.1,
      });
      claudeResponse = text;
    } catch (err) {
      console.error("Claude error:", err);
      return NextResponse.json(buildFallbackResponse(origin, destination, destCountry.name, routeRisk, transitHubRisk), { status: 200 });
    }

    // ── Parse Claude JSON output ───────────────────────────────────────────────

    let parsed: { assessment: TravelResponse["assessment"]; assessmentLabel: string; verifiedAsOf: string; sections: TravelSection[] };
    try {
      // Strip any accidental markdown fences
      const clean = claudeResponse.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("JSON parse error. Claude output:", claudeResponse.slice(0, 500));
      return NextResponse.json(buildFallbackResponse(origin, destination, destCountry.name, routeRisk, transitHubRisk), { status: 200 });
    }

    return NextResponse.json({
      assessment: parsed.assessment ?? assessment,
      assessmentLabel: parsed.assessmentLabel ?? routeRisk.message,
      sections: parsed.sections ?? [],
      verifiedAsOf: parsed.verifiedAsOf ?? new Date().toISOString().slice(0, 10),
      disclaimer:
        "This guidance is derived from the Cannabis Knowledge Foundation knowledge base. Laws change — verify all requirements with the relevant embassy before travel. This is not legal advice.",
    } satisfies TravelResponse);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Fallback (used if Claude or JSON parse fails) ─────────────────────────────

function buildFallbackResponse(
  _origin: string,
  _destination: string,
  destName: string,
  routeRisk: ReturnType<typeof assessRouteRisk>,
  transitHubRisk: ReturnType<typeof assessTransitHub>
): TravelResponse {
  const assessment: TravelResponse["assessment"] =
    routeRisk.level === "high" ? "red" : routeRisk.level === "conditional" ? "amber" : "green";

  const assessmentLabel =
    assessment === "red"
      ? `Do not travel to ${destName} with cannabis. Your prescription provides no legal protection there.`
      : `Travelling to ${destName} with cannabis requires advance planning. Read carefully.`;

  const sections: TravelSection[] = [];

  if (transitHubRisk) {
    sections.push({
      id: "transit_warning",
      level: "warning",
      heading: `Transit Warning — ${transitHubRisk.city}, ${transitHubRisk.country}`,
      body: `${transitHubRisk.country} has zero tolerance for cannabis, including prescribed medical cannabis. Passengers have been arrested at this transit hub for trace amounts. Your prescription provides no protection. Strongly consider re-routing to avoid this hub, or do not carry cannabis on this journey.`,
    });
  }

  if (routeRisk.message) {
    sections.push({
      id: "documents",
      heading: "Documents You Need",
      body: "Your prescription (original), a travel letter from your clinic (allow 3–4 weeks to obtain), and your medicine in its original labelled packaging. Check with the destination country's embassy for any additional requirements.",
    });
  }

  sections.push(
    {
      id: "before_you_go",
      heading: "Before You Go",
      body: "1. Contact your clinic and request a travel letter as soon as you book.\n2. Carry only the quantity you need for the trip.\n3. Keep all documentation in your hand luggage.",
    },
    {
      id: "if_stopped",
      heading: "If You're Stopped",
      body: "Stay calm. Present your prescription and travel letter. Say: \"I have a valid medical prescription — here is my documentation.\" If detained, contact your home country's embassy immediately.",
    },
    {
      id: "when_you_arrive",
      heading: "When You Get There",
      body: "Check local access pathways on arrival. If you need medical assistance, contact a local clinic or hospital.",
    }
  );

  return {
    assessment,
    assessmentLabel,
    sections,
    verifiedAsOf: new Date().toISOString().slice(0, 10),
    disclaimer:
      "This guidance could not be fully retrieved from the knowledge base. Verify all requirements with the destination country's embassy before travel. This is not legal advice.",
  };
}
