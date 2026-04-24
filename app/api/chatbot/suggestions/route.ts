import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ suggestions: [] }, { status: 401 });
  }

  const { messages } = await request.json();

  // Build a short summary of the conversation for context
  const lastFew = messages.slice(-4); // last 4 messages is enough context
  const conversationSummary = lastFew
    .map((m: { role: string; content: string }) =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 200)}`
    )
    .join("\n");

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"), // fast + cheap for this task
      prompt: `Based on this cannabis knowledge base conversation, suggest 4 short follow-up questions the user might want to ask next. The questions should be specific, varied, and directly relevant to cannabis research, clinical use, or regulation.

Conversation:
${conversationSummary}

Return ONLY a JSON array of 4 strings. No explanation, no markdown, no preamble. Example format:
["Question one?", "Question two?", "Question three?", "Question four?"]`,
      maxTokens: 200,
      temperature: 0.7,
    });

    // Parse the JSON array from the response
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const suggestions = JSON.parse(cleaned);

    if (!Array.isArray(suggestions)) {
      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 4).map((s: unknown) => String(s)),
    });
  } catch {
    // Fail silently — suggestions are a nice-to-have, not critical
    return NextResponse.json({ suggestions: [] });
  }
}
