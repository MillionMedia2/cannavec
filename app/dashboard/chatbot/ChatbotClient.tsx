"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_SUGGESTIONS = [
  "What conditions can cannabis be prescribed for?",
  "What does the evidence say about CBD for anxiety?",
  "How does THC affect the endocannabinoid system?",
  "What are the risks of long-term cannabis use?",
];

// Thinking indicator — animated dots + pulsing "Thinking" text
function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:300ms]" />
        </div>
        <span className="text-xs text-gray-400 animate-pulse">Thinking…</span>
      </div>
    </div>
  );
}

// Rendered markdown for assistant messages
function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-800
      prose-headings:font-semibold prose-headings:text-cannavec-900
      prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
      prose-p:leading-relaxed prose-p:my-1
      prose-ul:my-1 prose-ol:my-1
      prose-li:my-0.5
      prose-strong:text-cannavec-900
      prose-table:text-xs prose-table:w-full
      prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
      prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-gray-100
      prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs
      prose-blockquote:border-l-2 prose-blockquote:border-[#8a9a5a] prose-blockquote:pl-3 prose-blockquote:text-gray-500
      prose-a:text-[#8a9a5a] prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

// Suggestion chips — compact scrollable row, works on mobile
function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
}: {
  suggestions: string[];
  onSelect: (s: string) => void;
  disabled: boolean;
}) {
  if (suggestions.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          disabled={disabled}
          className="shrink-0 text-xs text-gray-600 border border-gray-200 rounded-full px-3 py-1.5
            hover:border-[#8a9a5a] hover:text-[#8a9a5a] transition-colors disabled:opacity-40
            disabled:cursor-not-allowed whitespace-nowrap"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function ChatbotClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking]);

  // Generate 4 new follow-up suggestions after each assistant response
  async function generateSuggestions(lastExchange: Message[]) {
    try {
      const res = await fetch("/api/chatbot/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: lastExchange }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions.slice(0, 4));
      }
    } catch {
      // fail silently — suggestions are non-critical
    }
  }

  async function submit(query: string) {
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSuggestions([]); // clear chips while responding
    setIsLoading(true);
    setIsThinking(true); // show thinking indicator immediately

    const assistantId = `a-${Date.now()}`;

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let firstChunk = true;
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        if (firstChunk) {
          // First content received — replace thinking indicator with message bubble
          firstChunk = false;
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: chunk },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      }

      // Generate follow-up suggestions based on the exchange
      const finalMessages = [
        ...next,
        { id: assistantId, role: "assistant" as const, content: fullContent },
      ];
      generateSuggestions(finalMessages);

    } catch {
      setIsThinking(false);
      setMessages((prev) => {
        // If we never added the assistant message, add error now
        const hasAssistant = prev.some((m) => m.id === assistantId);
        if (hasAssistant) {
          return prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Something went wrong. Please try again." }
              : m
          );
        }
        return [
          ...prev,
          { id: assistantId, role: "assistant", content: "Something went wrong. Please try again." },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <h1 className="text-lg font-display font-semibold text-cannavec-900">
          Cannabis Knowledge Base
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          FAQ checked first · then full knowledge base
        </p>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-12">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#8a9a5a" }}
            >
              <span className="text-white font-mono text-sm font-bold">cv</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Ask anything about cannabis research
              </p>
              <p className="text-xs text-gray-400 mt-1">
                FAQ is checked first, then the full knowledge base
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {INITIAL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-[#8a9a5a] hover:text-[#8a9a5a] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "user" ? (
              <div
                className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white"
                style={{ backgroundColor: "#8a9a5a" }}
              >
                {m.content}
              </div>
            ) : (
              <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                {m.content ? (
                  <AssistantMessage content={m.content} />
                ) : null}
              </div>
            )}
          </div>
        ))}

        {/* Thinking indicator — shown while waiting for first chunk */}
        {isThinking && <ThinkingIndicator />}
      </div>

      {/* Input area — suggestions + text box */}
      <div className="px-4 sm:px-6 py-3 border-t border-gray-100 shrink-0 space-y-2">
        {/* Suggestion chips */}
        <SuggestionChips
          suggestions={suggestions}
          onSelect={submit}
          disabled={isLoading}
        />

        {/* Text input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex gap-2 items-end"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question about cannabis research…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8a9a5a] focus:border-transparent max-h-32 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#8a9a5a" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
