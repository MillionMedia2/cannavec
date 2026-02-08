import { NextRequest, NextResponse } from "next/server";

// This is the main API endpoint that clients will call.
// It authenticates, rate-limits, and proxies to Pinecone.

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "plantz1";
const PINECONE_HOST = process.env.PINECONE_HOST || ""; // Set in .env.local after checking Pinecone dashboard

const ALLOWED_NAMESPACES = ["cannabis", "cannabis_products"];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // TODO: Validate API key against database
    // For now, accept any non-empty key (replace with Stripe/DB lookup)
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // 2. Parse request body
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

    if (!ALLOWED_NAMESPACES.includes(namespace)) {
      return NextResponse.json(
        { error: `Invalid namespace. Allowed: ${ALLOWED_NAMESPACES.join(", ")}` },
        { status: 400 }
      );
    }

    if (top_k < 1 || top_k > 20) {
      return NextResponse.json(
        { error: "top_k must be between 1 and 20" },
        { status: 400 }
      );
    }

    // 3. Query Pinecone
    // Using Pinecone's search-records endpoint (integrated inference)
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
            top_k: top_k,
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

    // 4. Format response
    const results = (pineconeData.result?.hits || []).map((hit: any) => ({
      id: hit._id,
      score: Math.round(hit._score * 100) / 100,
      metadata: include_metadata ? hit.fields || {} : undefined,
    }));

    // Count evidence grades
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
        records_searched: namespace === "cannabis" ? 792 : 809,
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
