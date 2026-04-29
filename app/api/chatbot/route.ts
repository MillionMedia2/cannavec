import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;
const FAQ_THRESHOLD = 0.5;

const SYSTEM_PROMPT = `You are Cannavec AI, a cannabis knowledge assistant for the Cannavec Cannabis Knowledge Foundation. You help researchers, advocates, clinicians, and industry professionals access accurate, evidence-based information.

Use the provided source material as your primary reference. Be precise and comprehensive. When evidence grades are mentioned in the source, include them. Do not diagnose or prescribe — describe what the research shows.

If the context doesn't fully answer the question, say what you can and acknowledge the gap rather than speculating.`;

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

function buildContext(hits: any[], source: "faq" | "kb"): string {
  if (source === "faq") {
    const f = hits[0].fields ?? {};
    const answer = f.answer_summary ?? f.answer ?? f.text ?? "";
    return `--- FAQ SOURCE ---\nQuestion: ${f.question ?? ""}\nAnswer: ${answer}\n------------------`;
  }
  return hits
    .map((hit, i) => {
      const f = hit.fields ?? {};
      const title = f.title ?? f.source ?? hit._id;
      const section = f.sectionHeading ? ` — ${f.sectionHeading}` : "";
      const grade = f.evidence_grade ? ` [${f.evidence_grade}]` : "";
      return `--- KB SOURCE ${i + 1}: ${title}${section}${grade} ---\n${f.text ?? f.content ?? ""}\n------------------`;
    })
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorised" }), {
      status: 401,
    });
  }

  const { messages } = await request.json();
  const query: string =
    [...messages].reverse().find((m: any) => m.role === "user")?.content ?? "";

  // Query both namespaces in parallel — always use KB, supplement with FAQ if relevant
  const [faqHits, kbHits] = await Promise.all([
    searchNamespace(query, "cannabis_faq", 1),
    searchNamespace(query, "cannabis", 5),
  ]);

  const contextParts: string[] = [];
  if (faqHits.length > 0 && faqHits[0]._score >= FAQ_THRESHOLD) {
    contextParts.push(buildContext(faqHits, "faq"));
  }
  if (kbHits.length > 0) {
    contextParts.push(buildContext(kbHits, "kb"));
  }
  const contextBlock = contextParts.join("\n\n");

  const augmented = messages.map((m: any, i: number) =>
    i === messages.length - 1 && m.role === "user" && contextBlock
      ? { ...m, content: `${contextBlock}\n\nUser question: ${m.content}` }
      : m
  );

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    messages: augmented,
    maxOutputTokens: 1024,
    temperature: 0.3,
  });

  // Stream plain text so ChatbotClient can read it with getReader()
  return result.toTextStreamResponse({ headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
