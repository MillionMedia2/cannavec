import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-keys";
import { isNamespaceAllowed, getAllowedNamespaces } from "@/lib/tiers";
import { createAdminClient } from "@/lib/supabase/admin";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST || "";

// Sanity guard — only allow well-formed namespace names to reach Pinecone
const VALID_NAMESPACE_PATTERN = /^[a-z0-9_]{1,64}$/;

export async function POST(request: NextRequest) {
  try {
    // 1. Extract Bearer token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const isDemoKey = token === "demo_public_key";

    // 2. Verify key and determine tier
    let tier = "free";
    let keyId: string | undefined;

    if (!isDemoKey) {
      const result = await verifyApiKey(token);
      if (!result.valid) {
        return NextResponse.json(
          { error: result.error ?? "Invalid API key" },
          { status: 401 }
        );
      }
      tier = result.tier!;
      keyId = result.key_id;
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const {
      query,
      namespace = "cannabis",
      top_k = 5,
      include_metadata = true,
    } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing required field: query" },
        { status: 400 }
      );
    }

    if (!VALID_NAMESPACE_PATTERN.test(namespace)) {
      return NextResponse.json(
        { error: "Invalid namespace name" },
        { status: 400 }
      );
    }

    // 4. Tier-based namespace access
    if (!isNamespaceAllowed(tier, namespace)) {
      return NextResponse.json(
        {
          error: `Your tier (${tier}) does not have access to namespace "${namespace}". Allowed namespaces: ${getAllowedNamespaces(tier).join(", ")}. Upgrade at https://cannavec.ai/pricing`,
        },
        { status: 403 }
      );
    }

    if (top_k < 1 || top_k > 20) {
      return NextResponse.json(
        { error: "top_k must be between 1 and 20" },
        { status: 400 }
      );
    }

    // 5. Query Pinecone
    const startTime = Date.now();

    const pineconeResponse = await fetch(
      `https://${PINECONE_HOST}/records/namespaces/${namespace}/search`,
      {
        method: "POST",
        headers: {
          "Api-Key": PINECONE_API_KEY,
          "Content-Type": "application/json",
          "X-Pinecone-API-Version": "2025-01",
        },
        body: JSON.stringify({
          query: {
            inputs: { text: query },
            top_k,
          },
        }),
      }
    );

    const responseTimeMs = Date.now() - startTime;

    if (!pineconeResponse.ok) {
      console.error("Pinecone error:", await pineconeResponse.text());
      return NextResponse.json(
        { error: "Knowledge base query failed" },
        { status: 500 }
      );
    }

    const pineconeData = await pineconeResponse.json();

    // 6. Update last_used_at (fire-and-forget — does not block response)
    if (keyId) {
      createAdminClient()
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyId)
        .then(() => {});
    }

    // 7. Format and return response
    const results = (pineconeData.result?.hits || []).map((hit: any) => ({
      id: hit._id,
      score: Math.round(hit._score * 100) / 100,
      metadata: include_metadata ? hit.fields || {} : undefined,
    }));

    const evidenceGrades: Record<string, number> = {};
    results.forEach((r: any) => {
      const grade = r.metadata?.evidence_grade;
      if (grade) {
        evidenceGrades[grade] = (evidenceGrades[grade] || 0) + 1;
      }
    });

    return NextResponse.json({
      results,
      meta: {
        response_time_ms: responseTimeMs,
        namespace,
        query_length: query.length,
        results_returned: results.length,
        evidence_grades: evidenceGrades,
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
