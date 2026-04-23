const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;

export async function searchNamespace(
  query: string,
  namespace: string,
  top_k: number
): Promise<any[]> {
  const res = await fetch(
    `https://${PINECONE_HOST}/records/namespaces/${namespace}/search`,
    {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": "2025-01",
      },
      body: JSON.stringify({
        query: { inputs: { text: query }, top_k },
      }),
    }
  );
  if (!res.ok) throw new Error("Knowledge base query failed");
  const data = await res.json();
  return data.result?.hits ?? [];
}

export function formatKbHits(hits: any[]): string {
  if (hits.length === 0) return "No results found for your query.";
  return hits
    .map((hit, i) => {
      const f = hit.fields ?? {};
      const score = Math.round(hit._score * 100) / 100;
      const title = f.title ?? f.source ?? hit._id;
      const text = f.text ?? f.content ?? "";
      const grade = f.evidence_grade ? ` [${f.evidence_grade}]` : "";
      return `${i + 1}. **${title}**${grade} (score: ${score})\n${text}`;
    })
    .join("\n\n");
}

export function formatFaqHits(hits: any[]): string {
  if (hits.length === 0) return "No results found for your query.";
  return hits
    .map((hit, i) => {
      const f = hit.fields ?? {};
      const score = Math.round(hit._score * 100) / 100;
      const question = f.question ?? f.title ?? hit._id;
      const answer = f.answer_summary ?? f.answer ?? f.text ?? "";
      const category = f.category ? ` [${f.category}]` : "";
      return `${i + 1}. **Q: ${question}**${category} (score: ${score})\n${answer}`;
    })
    .join("\n\n");
}
