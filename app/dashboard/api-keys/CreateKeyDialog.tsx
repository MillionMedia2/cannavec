"use client";

import { useState, useRef, useEffect } from "react";
import { createKeyAction } from "./actions";
import { X, Copy, Check, AlertCircle, Key } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateKeyDialog({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plaintext, setPlaintext] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const result = await createKeyAction(name.trim());
    if ("error" in result) {
      setError(result.error);
    } else {
      setPlaintext(result.plaintext);
      onCreated();
    }
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && !plaintext) handleCreate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && !plaintext && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl border border-warm-200 shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
          <h2 className="font-display text-lg text-cannavec-900">
            {plaintext ? "Your new API key" : "Create API key"}
          </h2>
          {!plaintext && (
            <button onClick={onClose} className="text-warm-400 hover:text-warm-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {plaintext ? (
            /* Show key once */
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Copy this key now.</strong> It will not be shown again.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-400 mb-1.5 uppercase tracking-wide">
                  API key
                </label>
                <div className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-lg px-3 py-2.5">
                  <code className="flex-1 font-mono text-xs text-cannavec-800 break-all">
                    {plaintext}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-1.5 rounded-md hover:bg-warm-200 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied
                      ? <Check className="w-4 h-4 text-accent" />
                      : <Copy className="w-4 h-4 text-warm-400" />
                    }
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full cannavec-btn-primary text-sm !py-2.5"
              >
                Done — I've copied my key
              </button>
            </div>
          ) : (
            /* Name input form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cannavec-800 mb-1.5">
                  Key name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Claude Desktop"
                  maxLength={64}
                  className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500 transition"
                />
                <p className="text-xs text-warm-400 mt-1">
                  Give it a name so you remember where it's used.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-warm-200 text-sm text-warm-600 hover:bg-warm-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !name.trim()}
                  className="flex-1 cannavec-btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Create key
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
