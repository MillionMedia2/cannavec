import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — Cannavec",
  description: "Complete API reference for the Cannavec cannabis knowledge API.",
};

export default function DocsPage() {
  return (
    <>
      <section className="py-16 sm:py-20 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-display text-cannavec-900 mb-4">API Documentation</h1>
          <p className="text-lg text-warm-500 max-w-2xl">
            Everything you need to integrate Cannavec into your platform. RESTful JSON API with semantic search across thousands of verified cannabis records.
          </p>
        </div>
      </section>

      <section className="py-12 bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div id="auth">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Authentication</h2>
            <p className="text-warm-500 mb-4">All requests require a Bearer token in the Authorization header.</p>
            <div className="demo-terminal">
              <div className="demo-terminal-header"><div className="demo-terminal-dot bg-red-500/80" /><div className="demo-terminal-dot bg-yellow-500/80" /><div className="demo-terminal-dot bg-green-500/80" /><span className="ml-3 text-xs text-white/30">headers</span></div>
              <pre className="text-sm text-white/80">{`Authorization: Bearer your_api_key_here
Content-Type: application/json`}</pre>
            </div>
          </div>

          <div id="base-url">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Base URL</h2>
            <div className="px-4 py-3 bg-cannavec-950 rounded-lg inline-block">
              <code className="text-sm text-accent-light font-mono">https://cannavec.ai/api/v1</code>
            </div>
          </div>

          <div id="search">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Search Endpoint</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-mono font-bold rounded">POST</span>
              <code className="text-sm font-mono text-warm-500">/search</code>
            </div>

            <h3 className="text-lg font-display text-cannavec-900 mb-3">Request</h3>
            <div className="demo-terminal mb-6">
              <div className="demo-terminal-header"><div className="demo-terminal-dot bg-red-500/80" /><div className="demo-terminal-dot bg-yellow-500/80" /><div className="demo-terminal-dot bg-green-500/80" /><span className="ml-3 text-xs text-white/30">POST /api/v1/search</span></div>
              <pre className="text-sm text-white/80">{`{
  "query": "What does the evidence say about CBD for anxiety?",
  "namespace": "cannabis",
  "top_k": 5,
  "include_metadata": true
}`}</pre>
            </div>

            <h3 className="text-lg font-display text-cannavec-900 mb-3">Response</h3>
            <div className="demo-terminal">
              <div className="demo-terminal-header"><div className="demo-terminal-dot bg-red-500/80" /><div className="demo-terminal-dot bg-yellow-500/80" /><div className="demo-terminal-dot bg-green-500/80" /><span className="ml-3 text-xs text-white/30">200 OK</span></div>
              <pre className="text-sm text-white/80">{`{
  "results": [
    {
      "id": "cbd_anxiety_clinical_001",
      "score": 0.94,
      "metadata": {
        "topic": "CBD Anxiolytic Mechanisms",
        "finding": "CBD demonstrates anxiolytic effects...",
        "evidence_grade": "Level A",
        "authority_score": 9,
        "clinical_relevance": "Multiple RCTs support doses of 300-600mg...",
        "sources": "Zuardi et al. 2017; Blessing et al. 2015"
      }
    }
  ],
  "meta": {
    "response_time_ms": 142,
    "namespace": "cannabis"
  }
}`}</pre>
            </div>
          </div>

          <div id="namespaces">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Namespaces</h2>
            <div className="space-y-4">
              <div className="p-5 bg-white rounded-xl border border-warm-200">
                <code className="px-2 py-1 bg-cannavec-50 text-cannavec-700 text-xs font-mono rounded">cannabis</code>
                <span className="text-xs text-warm-400 ml-2">hundreds of records</span>
                <p className="text-sm text-warm-500 mt-2">Core cannabis science: mechanisms, clinical evidence, dosing, drug interactions, safety, regulation.</p>
              </div>
              <div className="p-5 bg-white rounded-xl border border-warm-200">
                <code className="px-2 py-1 bg-cannavec-50 text-cannavec-700 text-xs font-mono rounded">cannabis_products</code>
                <span className="text-xs text-warm-400 ml-2">hundreds of records</span>
                <p className="text-sm text-warm-500 mt-2">UK/EU cannabis products: formulations, terpene profiles, cannabinoid content, consumption methods.</p>
              </div>
            </div>
          </div>

          <div id="rate-limits">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Rate Limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-xl border border-warm-200 overflow-hidden">
                <thead><tr className="border-b border-warm-200 bg-warm-50">
                  <th className="text-left py-3 px-4 font-medium text-cannavec-900">Tier</th>
                  <th className="text-left py-3 px-4 font-medium text-cannavec-900">Monthly</th>
                  <th className="text-left py-3 px-4 font-medium text-cannavec-900">Per Minute</th>
                </tr></thead>
                <tbody className="text-warm-500">
                  <tr className="border-b border-warm-100"><td className="py-3 px-4">Enterprise</td><td className="py-3 px-4">Unlimited</td><td className="py-3 px-4">100</td></tr>
                  <tr className="border-b border-warm-100"><td className="py-3 px-4">Professional</td><td className="py-3 px-4">50,000</td><td className="py-3 px-4">60</td></tr>
                  <tr className="border-b border-warm-100"><td className="py-3 px-4">Startup</td><td className="py-3 px-4">10,000</td><td className="py-3 px-4">30</td></tr>
                  <tr className="border-b border-warm-100"><td className="py-3 px-4">Advocacy</td><td className="py-3 px-4">5,000</td><td className="py-3 px-4">10</td></tr>
                  <tr><td className="py-3 px-4">Demo</td><td className="py-3 px-4">5/day</td><td className="py-3 px-4">1</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="examples">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Quick Start</h2>
            <h3 className="text-lg font-display text-cannavec-900 mb-3">cURL</h3>
            <div className="demo-terminal mb-6">
              <div className="demo-terminal-header"><div className="demo-terminal-dot bg-red-500/80" /><div className="demo-terminal-dot bg-yellow-500/80" /><div className="demo-terminal-dot bg-green-500/80" /></div>
              <pre className="text-sm text-white/80">{`curl -X POST https://cannavec.ai/api/v1/search \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "CBD for anxiety", "namespace": "cannabis", "top_k": 3}'`}</pre>
            </div>

            <h3 className="text-lg font-display text-cannavec-900 mb-3">Python</h3>
            <div className="demo-terminal mb-6">
              <div className="demo-terminal-header"><div className="demo-terminal-dot bg-red-500/80" /><div className="demo-terminal-dot bg-yellow-500/80" /><div className="demo-terminal-dot bg-green-500/80" /></div>
              <pre className="text-sm text-white/80">{`import requests

resp = requests.post(
    "https://cannavec.ai/api/v1/search",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"query": "THC:CBD ratios for pain", "namespace": "cannabis", "top_k": 5}
)
for r in resp.json()["results"]:
    print(f"[{r['metadata']['evidence_grade']}] {r['metadata']['topic']}")`}</pre>
            </div>

            <h3 className="text-lg font-display text-cannavec-900 mb-3">JavaScript</h3>
            <div className="demo-terminal">
              <div className="demo-terminal-header"><div className="demo-terminal-dot bg-red-500/80" /><div className="demo-terminal-dot bg-yellow-500/80" /><div className="demo-terminal-dot bg-green-500/80" /></div>
              <pre className="text-sm text-white/80">{`const res = await fetch("https://cannavec.ai/api/v1/search", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    query: "Terpene profiles for sleep",
    namespace: "cannabis", top_k: 5
  })
});
const { results } = await res.json();`}</pre>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
