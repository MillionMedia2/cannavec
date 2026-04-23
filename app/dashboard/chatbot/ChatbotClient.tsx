"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What conditions can cannabis be prescribed for?",
  "What does the evidence say about CBD for anxiety?",
  "How does THC affect the endocannabinoid system?",
  "What are the risks of long-term cannabis use?",
];

export function ChatbotClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
    setIsLoading(true);

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
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
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-lg font-display font-semibold text-cannavec-900">
          Cannabis Knowledge Base
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          FAQ checked first · then full knowledge base
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
              {STARTERS.map((s) => (
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
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
              style={
                m.role === "user" ? { backgroundColor: "#8a9a5a" } : undefined
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100">
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
        <p className="text-xs text-gray-400 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
