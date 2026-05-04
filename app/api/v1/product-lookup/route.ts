import { NextRequest, NextResponse } from "next/server";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST || "";

/**
 * Product Lookup API — multi-step reasoning:
 *
 * Step 1: Search cannabis namespace to validate the condition can be treated
 *         with cannabis and discover which cannabinoids/terpenes are relevant.
 * Step 2: Search cannabis_products namespace for products matching those
 *         terpene/condition profiles, filtered by product_form if provided.
 * Step 3: Return top 3 products with reasoning.
 */

async function pineconeSearch(
  namespace: string,
  query: string,
  topK: number,
  filter?: Record<string, any>
) {
  const body: any = {
    query: { inputs: { text: query }, top_k: topK },
  };
  if (filter) {
    body.query.filter = filter;
  }

  const res = await fetch(
    `https://${PINECONE_HOST}/records/namespaces/${namespace}/search`,
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
    const errText = await res.text();
    console.error(`Pinecone error (${namespace}):`, errText);
    throw new Error(`Knowledge base query failed (${namespace})`);
  }

  const data = await res.json();
  return (data.result?.hits || []).map((hit: any) => ({
    id: hit._id,
    score: Math.round(hit._score * 100) / 100,
    metadata: hit.fields || {},
  }));
}

// Build a terpene-condition reasoning bridge from cannabis KB results
function extractTerpeneReasoning(cannabisResults: any[]): {
  supportedConditions: string[];
  relevantTerpenes: string[];
  reasoning: string[];
  evidenceGrades: string[];
} {
  const supportedConditions: string[] = [];
  const relevantTerpenes = new Set<string>();
  const reasoning: string[] = [];
  const evidenceGrades: string[] = [];

  for (const r of cannabisResults) {
    const m = r.metadata;
    if (m.topic || m.finding || m.text) {
      reasoning.push(m.finding || m.topic || (typeof m.text === "string" ? m.text.slice(0, 300) : ""));
    }
    if (m.evidence_grade) {
      evidenceGrades.push(m.evidence_grade);
    }
    // Extract terpenes mentioned in the knowledge base
    const text = JSON.stringify(m).toLowerCase();
    const knownTerpenes = [
      "myrcene", "caryophyllene", "limonene", "pinene",
      "linalool", "humulene", "terpinolene", "ocimene",
      "bisabolol", "geraniol", "nerolidol",
    ];
    for (const t of knownTerpenes) {
      if (text.includes(t)) relevantTerpenes.add(t);
    }
  }

  return {
    supportedConditions,
    relevantTerpenes: Array.from(relevantTerpenes),
    reasoning,
    evidenceGrades,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { condition, product_form } = body;

    if (!condition || typeof condition !== "string" || condition.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a condition to search for." },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // ── Step 1: Validate condition against the cannabis knowledge base ──
    const conditionQuery = `${condition} treatment cannabis terpenes cannabinoids`;
    const cannabisResults = await pineconeSearch("cannabis", conditionQuery, 5);

    if (!cannabisResults.length || cannabisResults[0].score < 0.3) {
      return NextResponse.json({
        step: "validation",
        supported: false,
        condition,
        message: `We couldn't find strong evidence in our knowledge base linking cannabis to "${condition}". This doesn't mean cannabis can't help — it may mean the evidence is limited or the condition isn't in our database yet.`,
        suggestion: "Try a broader term (e.g., 'chronic pain' instead of 'fibromyalgia') or browse our knowledge base for related conditions.",
        meta: { response_time_ms: Date.now() - startTime },
      });
    }

    // ── Step 2: Extract terpene/cannabinoid reasoning ──
    const { relevantTerpenes, reasoning, evidenceGrades } =
      extractTerpeneReasoning(cannabisResults);

    // ── Step 3: Search products matching the condition + terpenes ──
    // Build a rich query combining the condition, relevant terpenes, and effects
    const productQuery = `${condition} ${relevantTerpenes.join(" ")}`;

    // Build Pinecone metadata filter for product_form if provided
    let productFilter: Record<string, any> | undefined;
    if (product_form && product_form !== "all") {
      productFilter = { product_form: { "$eq": product_form } };
    }

    const productResults = await pineconeSearch(
      "cannabis_products",
      productQuery,
      3,
      productFilter
    );

    const responseTimeMs = Date.now() - startTime;

    // ── Step 4: Format response with full reasoning chain ──
    const products = productResults.map((p: any) => ({
      product_name: p.metadata.product_name,
      brand: p.metadata.brand,
      sku: p.metadata.sku,
      score: p.score,
      thc: p.metadata.thc_raw || `${p.metadata.thc_percent}%`,
      cbd: p.metadata.cbd_raw || `${p.metadata.cbd_percent}%`,
      product_form: p.metadata.product_form,
      strain_name: p.metadata.strain_name || null,
      strain_type: p.metadata.strain_type || null,
      terpenes: p.metadata.terpenes || [],
      conditions: p.metadata.conditions || [],
      effects: p.metadata.effects || [],
      price: p.metadata.price_gbp ? `£${p.metadata.price_gbp}` : null,
      quantity: p.metadata.quantity_value
        ? `${p.metadata.quantity_value}${p.metadata.quantity_unit}`
        : null,
      flavour: p.metadata.flavour || p.metadata.flavour_category || null,
      medical_notes: p.metadata.medical_notes || null,
      potency: p.metadata.potency || null,
      product_type: p.metadata.product_type || null,
      jurisdiction: p.metadata.jurisdiction || null,
    }));

    return NextResponse.json({
      step: "results",
      supported: true,
      condition,
      product_form_filter: product_form || "all",
      evidence_summary: {
        relevant_terpenes: relevantTerpenes,
        evidence_grades: evidenceGrades,
        knowledge_base_reasoning: reasoning.slice(0, 3),
      },
      products,
      meta: {
        response_time_ms: responseTimeMs,
        cannabis_results_checked: cannabisResults.length,
        products_returned: products.length,
      },
    });
  } catch (error: any) {
    console.error("Product Lookup API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
