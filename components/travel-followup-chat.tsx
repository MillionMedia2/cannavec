"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TravelFollowUpChatProps {
  /** Serialised summary of the travel result — passed to the API as context */
  travelContext: string;
  /** Suggested follow-up questions based on the travel result */
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "What exactly should my travel letter say?",
  "Can I get a prescription at my destination?",
  "What if I'm stopped and they don't speak English?",
  "How much cannabis can I take?",
];

function StagedThinking({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const label =
    elapsed > 20000 ? "Nearly there…" :
    elapsed > 10000 ? "Still thinking…" :
    "Thinking…";

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5a] animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-warm-400 animate-pulse">{label}</span>
    </div>
  );
}

export function TravelFollowUpChat({ travelContext, suggestions }: TravelFollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStart, setThinkingStart] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chips = suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking]);

  async function submit(query: string) {
    if (!query.trim() || isLoading) return;

    setHasInteracted(true);
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: query };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    setIsThinking(true);
    setThinkingStart(Date.now());

    const assistantId = `a-${Date.now()}`;

    try {
      const res = await fetch("/api/v1/travel/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          travelContext,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (firstChunk) {
          firstChunk = false;
          setIsThinking(false);
          setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: chunk }]);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          );
        }
      }
    } catch {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "Something went wrong. Please try again." },
      ]);
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

  const containerHeight = expanded ? "h-[480px]" : "h-[280px]";

  return (
    <div className="bg-white rounded-xl border border-warm-200 overflow-hidden flex flex-col">
      {/* Header — always visible, toggles expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-3 border-b border-warm-100 hover:bg-warm-50 transition-colors shrink-0"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#8a9a5a]" />
          <span className="text-sm font-medium text-cannavec-900">
            Ask a follow-up question
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-warm-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-warm-400" />
        )}
      </button>

      {/* Chat area — fixed height with internal scroll */}
      <div className={`${containerHeight} flex flex-col transition-all duration-200`}>
        {/* Messages scroll area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {!hasInteracted && (
            <div className="text-center py-4">
              <p className="text-xs text-warm-400 mb-3">
                Have a question about your trip? Ask below.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {chips.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    disabled={isLoading}
                    className="text-xs text-warm-500 border border-warm-200 rounded-full px-2.5 py-1 hover:border-[#8a9a5a] hover:text-[#8a9a5a] transition-colors disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "user" ? (
                <div
                  className="max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed text-white"
                  style={{ backgroundColor: "#8a9a5a" }}
                >
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-warm-50 px-3 py-2">
                  <div className="prose prose-xs max-w-none text-warm-700
                    prose-p:text-xs prose-p:leading-relaxed prose-p:my-1
                    prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-li:text-xs
                    prose-strong:text-cannavec-900
                    prose-headings:text-sm prose-headings:font-semibold prose-headings:text-cannavec-900 prose-headings:mt-2 prose-headings:mb-1
                    prose-a:text-[#8a9a5a] prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isThinking && <StagedThinking startTime={thinkingStart} />}
        </div>

        {/* Input — pinned at bottom of the chat container */}
        <div className="px-3 py-2 border-t border-warm-100 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className="flex gap-2 items-end"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about your trip…"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-warm-200 px-3 py-2 text-xs text-cannavec-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-[#8a9a5a] focus:border-transparent max-h-20 overflow-y-auto"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#8a9a5a" }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
