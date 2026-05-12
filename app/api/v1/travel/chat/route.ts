// Travel follow-up chat — streams answers with travel context baked in.

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;

async function searchNamespace(query: string, namespace: string, top_k: number) {
  const res = await fetch(
    `https://${PINECONE_HOST}/records/namespaces/${namespace}/search`,
    {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": "2025-01",
      },
      body: JSON.stringify({ query: { inputs: { text: query }, top_k } }),
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.result?.hits ?? [];
}

function buildKBContext(hits: any[]): string {
  return hits
    .map((hit: any, i: number) => {
      const f = hit.fields ?? {};
      const title = f.title ?? f.source ?? hit._id;
      const section = f.sectionHeading ? ` — ${f.sectionHeading}` : "";
      const grade = f.evidence_grade ? ` [${f.evidence_grade}]` : "";
      return `--- SOURCE ${i + 1}: ${title}${section}${grade} ---\n${f.text ?? f.content ?? ""}\n---`;
    })
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401 });
  }

  const { messages, travelContext } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
  }

  // Build search query from recent user turns
  const recentUserTurns = messages
    .filter((m: any) => m.role === "user")
    .slice(-3)
    .map((m: any) => m.content)
    .join(" ");

  // Search KB for follow-up context
  const kbHits = await searchNamespace(recentUserTurns, "cannabis", 5);
  const kbContext = kbHits.length > 0 ? buildKBContext(kbHits) : "";

  // System prompt includes the original travel result as context
  const systemPrompt = `You are the Cannavec Cannabis Travel Planner follow-up assistant.

The patient has already received a travel assessment. They are now asking follow-up questions about their specific trip. Use the travel context below and the knowledge base sources to answer.

Write in plain English. Use "you" throughout. Be warm, direct, and practical. You are talking to a patient, not a lawyer or regulatory professional.

You are not a lawyer. Do not give legal advice. Give regulatory information based on verified primary sources. If you don't know something, say so — don't guess.

--- ORIGINAL TRAVEL CONTEXT ---
${travelContext || "No travel context provided."}
--- END TRAVEL CONTEXT ---

${kbContext ? `--- ADDITIONAL KNOWLEDGE BASE SOURCES ---\n${kbContext}\n--- END SOURCES ---` : ""}

Keep answers concise — 2-4 paragraphs maximum unless the question requires more detail. The patient has already read the main guide; they're looking for specifics or clarification, not a repeat of what they already have.`;

  // Pass conversation history (capped at 10 messages)
  const trimmed = messages.slice(-10);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: trimmed,
    maxOutputTokens: 1024,
    temperature: 0.3,
  });

  return result.toTextStreamResponse({
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
