"use client";

import { useState } from "react";
import { Check, Copy, AlertTriangle, Terminal, Monitor, Globe, ChevronDown, ChevronUp } from "lucide-react";

interface ApiKeyOption {
  id: string;
  name: string | null;
  key_prefix: string;
}

export function MpcSetupClient({ keys }: { keys: ApiKeyOption[] }) {
  const [selectedId, setSelectedId] = useState(keys[0]?.id ?? "");
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<"desktop" | "code">("desktop");
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const selectedKey = keys.find((k) => k.id === selectedId);
  const keyPlaceholder = selectedKey?.key_prefix
    ? `${selectedKey.key_prefix}...`
    : "ck_live_…";

  const desktopConfig = JSON.stringify(
    {
      mcpServers: {
        cannavec: {
          type: "http",
          url: "https://www.cannavec.ai/api/mcp",
          headers: {
            Authorization: "Bearer YOUR_API_KEY",
          },
        },
      },
    },
    null,
    2
  );

  const codeCommand = `claude mcp add --transport http cannavec https://www.cannavec.ai/api/mcp \\
  --header "Authorization: Bearer YOUR_API_KEY"`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(desktopConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(
      `claude mcp add --transport http cannavec https://www.cannavec.ai/api/mcp --header "Authorization: Bearer YOUR_API_KEY"`
    );
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const toggleFaq = (id: string) => {
    setFaqOpen(faqOpen === id ? null : id);
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
    <div className="space-y-10">
      {/* ────────────────────────────────────────────── */}
      {/* Intro                                          */}
      {/* ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          MCP (Model Context Protocol) connects the Cannavec Cannabis Knowledge
          Base directly to your AI tools. Once connected, you can search the
          knowledge base, look up products, get regulatory overviews, and use
          Cannavec Skills — all from inside Claude. Because it runs within
          Claude, you can then ask it to create reports, presentations,
          summaries, or whatever you need from the data it returns.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          There are two supported connection methods:{" "}
          <strong>Claude Desktop</strong> (config file) and{" "}
          <strong>Claude Code</strong> (terminal command). Both use your API key
          for authentication.
        </p>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* Important notice — Custom Connector limitation */}
      {/* ────────────────────────────────────────────── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-900">
              Claude&apos;s web-based Custom Connector does not currently work
              with Cannavec
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              The &quot;Add custom connector&quot; dialog in Claude&apos;s web interface
              (claude.ai) only supports OAuth authentication. It does not yet
              have a field for Bearer tokens or API keys, which is what
              Cannavec uses. This means you cannot connect Cannavec MCP via
              that dialog — even if the URL validates at the Organisation
              level, it will fail to authenticate.
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              This is a known Anthropic platform limitation, not a Cannavec
              issue. It was{" "}
              <a
                href="https://github.com/anthropics/claude-ai-mcp/issues/112"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                raised on Anthropic&apos;s GitHub in March 2026
              </a>{" "}
              and is still being worked on. MCP is in its infancy and the
              tooling is being built in real time — Bearer token support for
              the Custom Connector UI will come, but it&apos;s not there yet.
            </p>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              Use one of the two methods below instead — both work fully.
            </p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* Step 1 — Select API key                        */}
      {/* ────────────────────────────────────────────── */}
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
              {k.name ?? "Unnamed key"} — {k.key_prefix}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          This is the key that authenticates your connection. You&apos;ll need the
          full key (starting{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">
            {keyPlaceholder}
          </code>
          ) — the one shown once when you created it.
        </p>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* Step 2 — Choose connection method               */}
      {/* ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Step 2 — Connect
        </h2>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("desktop")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "desktop"
                ? "bg-cannavec-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-cannavec-300"
            }`}
          >
            <Monitor className="w-4 h-4" />
            Claude Desktop
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "code"
                ? "bg-cannavec-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-cannavec-300"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Claude Code
          </button>
        </div>

        {/* Claude Desktop tab */}
        {activeTab === "desktop" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Add Cannavec to Claude Desktop by editing your config file. This
              is the recommended method — it&apos;s a one-time setup.
            </p>

            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="font-mono text-cannavec-400 shrink-0">1.</span>
                <span>
                  Open Claude Desktop → <strong>Settings</strong> →{" "}
                  <strong>Developer</strong> → <strong>Edit Config</strong>.
                  This opens your{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    claude_desktop_config.json
                  </code>{" "}
                  file.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cannavec-400 shrink-0">2.</span>
                <span>
                  Paste the config below into the file. Replace{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    YOUR_API_KEY
                  </code>{" "}
                  with your full API key starting{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    {keyPlaceholder}
                  </code>
                  . If the file already has other MCP servers, merge the{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    cannavec
                  </code>{" "}
                  entry into the existing{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    mcpServers
                  </code>{" "}
                  object.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cannavec-400 shrink-0">3.</span>
                <span>
                  Save the file, then <strong>fully quit</strong> Claude Desktop
                  (Cmd+Q on Mac, not just close the window) and reopen it.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cannavec-400 shrink-0">4.</span>
                <span>
                  Look for the Cannavec tools in your chat input. You should
                  see the MCP tools icon indicating the connection is active.
                </span>
              </li>
            </ol>

            <div className="relative">
              <pre className="rounded-lg bg-cannavec-950 text-green-300 text-xs p-4 overflow-x-auto leading-relaxed">
                {desktopConfig}
              </pre>
              <button
                onClick={handleCopyConfig}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                {copiedConfig ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <p className="text-xs text-gray-500">
                <strong>Config file location:</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Mac:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Windows:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  %APPDATA%\Claude\claude_desktop_config.json
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Claude Code tab */}
        {activeTab === "code" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              If you use Claude Code in the terminal, add Cannavec with a single
              command. Replace{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">
                YOUR_API_KEY
              </code>{" "}
              with your full key starting{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">
                {keyPlaceholder}
              </code>
              .
            </p>

            <div className="relative">
              <pre className="rounded-lg bg-cannavec-950 text-green-300 text-xs p-4 overflow-x-auto leading-relaxed">
                {codeCommand}
              </pre>
              <button
                onClick={handleCopyCmd}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              This writes the connection to your Claude Code config
              automatically. You&apos;re ready to go immediately — no restart
              needed.
            </p>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* Step 3 — Test it                                */}
      {/* ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Step 3 — Test it
        </h2>
        <p className="text-sm text-gray-600">
          Once connected, try asking Claude something like:
        </p>
        <div className="space-y-2">
          {[
            "Use the Cannavec tool to search for the effects of CBD on anxiety.",
            "Look up cannabis products available for chronic pain in the UK.",
            "What does the evidence say about terpenes and sleep? Create a summary report.",
            "Search Cannavec for drug interactions between cannabis and SSRIs, then create a PowerPoint with the findings.",
          ].map((example, i) => (
            <div
              key={i}
              className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 italic"
            >
              &quot;{example}&quot;
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Because Cannavec runs inside Claude, you can combine knowledge base
          queries with Claude&apos;s own capabilities — creating reports,
          presentations, summaries, comparison tables, or any document format
          from the data that comes back.
        </p>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* What you can do                                */}
      {/* ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          What you can do with Cannavec MCP
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              title: "Search the knowledge base",
              desc: "Query the full CKF cannabis knowledge base — clinical evidence, mechanisms, dosing, safety data.",
            },
            {
              title: "Look up products",
              desc: "Search the UK/EU cannabis products database by condition, terpene profile, product form, or brand.",
            },
            {
              title: "Regulatory overviews",
              desc: "Get jurisdiction-specific regulatory status, legal frameworks, and prescribing rules.",
            },
            {
              title: "Generate documents",
              desc: "Combine knowledge base results with Claude's document generation — reports, PowerPoints, patient summaries.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <h4 className="text-sm font-medium text-cannavec-900 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* Troubleshooting & FAQ                          */}
      {/* ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-cannavec-900 uppercase tracking-wide">
          Troubleshooting
        </h2>
        <div className="space-y-2">
          {[
            {
              id: "custom-connector",
              q: 'I tried adding Cannavec via Claude\'s "Add custom connector" and it says "Check the URL"',
              a: 'This is the known limitation described above. Claude\'s web-based Custom Connector only supports OAuth — it cannot pass Bearer tokens or API keys. Use the Claude Desktop config file or Claude Code terminal command instead. This applies to both Personal and Organisation level connectors in Claude Teams.',
            },
            {
              id: "key-in-url",
              q: "Should I put my API key in the URL?",
              a: "No. Your API key goes in the Authorization header, not in the URL. The MCP server URL is always just https://www.cannavec.ai/api/mcp — the config file or Claude Code command handles passing the key in the header automatically.",
            },
            {
              id: "not-appearing",
              q: "I added the config but Cannavec tools don't appear in Claude",
              a: "Make sure you fully quit Claude Desktop (Cmd+Q on Mac) and reopened it — just closing the window isn't enough. Also check that the config JSON is valid (no trailing commas, matching brackets) and that your API key is correct. If you have other MCP servers configured, make sure the cannavec entry was merged inside the existing mcpServers object, not added as a duplicate key.",
            },
            {
              id: "teams-pro",
              q: "Does this work with Claude Teams Pro?",
              a: "Yes. Claude Desktop and Claude Code both work with Teams Pro plans. The only limitation is the web-based Custom Connector in the Claude web interface, which doesn't support API key authentication yet. Use the config file method instead.",
            },
            {
              id: "which-tools",
              q: "Which tools will I see once connected?",
              a: "The tools available depend on your Cannavec tier. All tiers get search_cannabis_kb and regulatory tools. Higher tiers get product lookup, evidence grade filtering, and other Skills as they launch. Check the Skills page for a full list of what's available on your tier.",
            },
            {
              id: "rate-limits",
              q: "Are there rate limits on MCP?",
              a: "MCP connections use the same rate limits as your API tier. If you hit a limit, Claude will show the error message from Cannavec and you can try again after the cooldown period.",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(item.id)}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-sm text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                {item.q}
                {faqOpen === item.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                )}
              </button>
              {faqOpen === item.id && (
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* MCP is evolving note                           */}
      {/* ────────────────────────────────────────────── */}
      <div className="rounded-lg bg-cannavec-50 border border-cannavec-100 p-4">
        <p className="text-sm text-cannavec-800 leading-relaxed">
          <strong>MCP is evolving rapidly.</strong> The Model Context Protocol
          is still in its early stages and Anthropic are actively building out
          the tooling. Connection methods, authentication flows, and UI support
          are changing frequently. We&apos;ll keep this page updated as new
          options become available. If you run into any issues, contact us at{" "}
          <a
            href="mailto:hello@cannavec.ai"
            className="underline font-medium"
          >
            hello@cannavec.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
