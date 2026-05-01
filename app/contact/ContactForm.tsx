"use client";

import { ArrowRight, Send } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="p-6 bg-cannavec-50 rounded-xl border border-cannavec-100 text-center">
        <div className="w-12 h-12 bg-cannavec-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={20} className="text-cannavec-500" />
        </div>
        <h3 className="text-base font-display text-cannavec-900 mb-2">Message sent!</h3>
        <p className="text-sm text-warm-500">Thanks for getting in touch. We&apos;ll be in touch shortly.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-cannavec-500 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cannavec-900 mb-1">
          Name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-lg border border-warm-200 bg-white text-cannavec-900 placeholder:text-warm-400 focus:outline-none focus:border-cannavec-400 transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-cannavec-900 mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
          className="w-full px-4 py-3 rounded-lg border border-warm-200 bg-white text-cannavec-900 placeholder:text-warm-400 focus:outline-none focus:border-cannavec-400 transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-cannavec-900 mb-1">
          Message
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your project or what you need..."
          className="w-full px-4 py-3 rounded-lg border border-warm-200 bg-white text-cannavec-900 placeholder:text-warm-400 focus:outline-none focus:border-cannavec-400 transition-colors text-sm resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="cannavec-btn-primary text-sm w-full justify-center disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
        <ArrowRight size={16} className="ml-2" />
      </button>
    </form>
  );
}
