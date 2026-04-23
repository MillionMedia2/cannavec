"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface ApiKeyOption {
  id: string;
  name: string | null;
  prefix: string;
}

export function MpcSetupClient({ keys }: { keys: ApiKeyOption[] }) {
  const [selectedId, setSelectedId] = useState(keys[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const selectedKey = keys.find((k) => k.id === selectedId);

  const config = selectedKey
    ? JSON.stringify(
        {
          mcpServers: {
            cannavec: {
              url: "https://www.cannavec.ai/api/mcp",
              headers: {
                Authorization: "Bearer YOUR_API_KEY",
              },
            },
          },
        },
        null,
        2
      )
    : null;

  const handleCopy = () => {
    if (!config) return;
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (keys.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        You don&apos;t have any active API keys.{" "}
        <a href="/dashboard/api-keys" className="underline font-medium">
          Generate one first.
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Step 1 — Select your API key
        </h2>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cannavec-500"
        >
          {keys.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name ?? "Unnamed key"} — {k.prefix}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          This is the key that will authenticate Claude Desktop with Cannavec.
          Keep it secret.
        </p>
      </div>

      {/* Step 2 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Step 2 — Copy your config
        </h2>
        <p className="text-sm text-gray-600">
          Replace{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">YOUR_API_KEY</code>{" "}
          with the full key starting{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">
            {selectedKey?.prefix ?? "ck_live_…"}
          </code>{" "}
          (shown once when you created it). Then paste into your{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">claude_desktop_config.json</code>.
        </p>
        <div className="relative">
          <pre className="rounded-lg bg-cannavec-950 text-green-300 text-xs p-4 overflow-x-auto">
            {config}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Step 3 — Add to Claude Desktop
        </h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>
            Open Claude Desktop → <strong>Settings</strong> →{" "}
            <strong>Developer</strong>
          </li>
          <li>
            Click <strong>Edit Config</strong> — this opens{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              claude_desktop_config.json
            </code>
          </li>
          <li>
            Paste the config above (replacing any existing{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              mcpServers
            </code>{" "}
            block, or merging if you have other servers)
          </li>
          <li>Save the file and restart Claude Desktop</li>
          <li>
            Look for the{" "}
            <strong>
              <span className="text-cannavec-700">cannavec</span>
            </strong>{" "}
            tool icon in the chat input — that confirms it&apos;s connected
          </li>
        </ol>
      </div>

      {/* Step 4 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Step 4 — Test it
        </h2>
        <p className="text-sm text-gray-600">
          In Claude Desktop, ask something like:
        </p>
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-800 italic">
          &quot;Use the Cannavec tool to search for the effects of CBD on anxiety.&quot;
        </div>
        <p className="text-sm text-gray-600">
          Claude will call <code className="bg-gray-100 px-1 rounded text-xs">search_cannabis_kb</code> and
          return results from the knowledge base.
        </p>
      </div>
    </div>
  );
}
