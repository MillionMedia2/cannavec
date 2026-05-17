"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchTriageConditions, type TriageCondition } from "@/lib/triage/conditions";

interface ConditionPickerProps {
  value: { id?: string; label: string };
  onChange: (v: { id?: string; label: string }) => void;
}

/**
 * Typeahead condition picker.
 * - Starts matching from 2 chars
 * - Up to 8 suggestions, ranked by label/alias match strength
 * - Free-text fallback if the user doesn't pick a suggestion
 * - Picking a suggestion sets the ID; typing freely leaves ID undefined (handled as "unknown" classification)
 */
export function ConditionPicker({ value, onChange }: ConditionPickerProps) {
  const [query, setQuery] = useState(value.label);
  const [suggestions, setSuggestions] = useState<TriageCondition[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const results = searchTriageConditions(query);
    setSuggestions(results);
    setActiveIndex(-1);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleQueryChange(v: string) {
    setQuery(v);
    setShowSuggestions(true);
    // If they're typing freely, clear any previously-selected ID
    if (value.id) onChange({ label: v });
    else onChange({ ...value, label: v });
  }

  function selectSuggestion(s: TriageCondition) {
    setQuery(s.label);
    onChange({ id: s.id, label: s.label });
    setShowSuggestions(false);
  }

  function clearSelection() {
    setQuery("");
    onChange({ label: "" });
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing — e.g. pain, anxiety, MS, epilepsy"
          className="w-full pl-10 pr-10 py-3 border border-warm-200 rounded-lg text-cannavec-900 placeholder-warm-400 focus:outline-none focus:border-[#8a9a5a] focus:ring-1 focus:ring-[#8a9a5a]"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="condition-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `condition-option-${activeIndex}` : undefined}
        />
        {query && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="condition-suggestions"
          role="listbox"
          className="absolute z-10 left-0 right-0 mt-1 bg-white border border-warm-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`condition-option-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-4 py-2.5 cursor-pointer text-sm ${
                activeIndex === i ? "bg-[#f5f7f0] text-cannavec-900" : "text-warm-700"
              }`}
            >
              <div className="font-medium">{s.label}</div>
              {s.aliases.length > 0 && (
                <div className="text-xs text-warm-400 mt-0.5">
                  also: {s.aliases.slice(0, 3).join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {query.length >= 2 && suggestions.length === 0 && (
        <p className="mt-2 text-xs text-warm-500">
          No match found — that&apos;s fine, you can continue with what you&apos;ve typed and a clinician will assess.
        </p>
      )}
    </div>
  );
}
