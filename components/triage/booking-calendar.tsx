"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { generateSlots, groupSlotsByDay } from "@/lib/triage/slots";
import type { CalendarSlot } from "@/lib/triage/types";

interface BookingCalendarProps {
  selectedSlot: CalendarSlot | null;
  onSelect: (slot: CalendarSlot) => void;
}

/**
 * Mon-Fri 9-5 slot picker. All slots shown as available — the patient
 * expresses a preference, the clinic confirms when they call back.
 * (Freebusy filtering removed when we switched from Google Calendar to Airtable.)
 */
export function BookingCalendar({ selectedSlot, onSelect }: BookingCalendarProps) {
  const allSlots = useMemo(() => generateSlots(), []);
  const grouped = useMemo(() => groupSlotsByDay(allSlots), [allSlots]);
  const [showAll, setShowAll] = useState(false);
  const visibleDays = showAll ? grouped : grouped.slice(0, 5);

  return (
    <div>
      <p className="text-xs text-warm-500 mb-3">
        Choose a preferred time and the clinic will confirm when they call you back.
      </p>
      <div className="space-y-4">
        {visibleDays.map(({ dayLabel, slots }) => (
          <DayPanel
            key={dayLabel}
            dayLabel={dayLabel}
            slots={slots}
            selectedIso={selectedSlot?.iso ?? null}
            onSelect={onSelect}
          />
        ))}
      </div>
      {!showAll && grouped.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 w-full px-4 py-2.5 text-sm text-[#8a9a5a] hover:text-[#7a8a4a] border border-dashed border-warm-200 hover:border-[#8a9a5a] rounded-lg transition-colors"
        >
          Show more dates ({grouped.length - 5} more days)
        </button>
      )}
    </div>
  );
}

function DayPanel({
  dayLabel,
  slots,
  selectedIso,
  onSelect,
}: {
  dayLabel: string;
  slots: CalendarSlot[];
  selectedIso: string | null;
  onSelect: (slot: CalendarSlot) => void;
}) {
  return (
    <div className="border border-warm-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-warm-50 border-b border-warm-200 flex items-center gap-2">
        <Clock className="w-4 h-4 text-warm-500" />
        <span className="text-sm font-medium text-cannavec-900">{dayLabel}</span>
      </div>
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {slots.map((s) => {
          const isSelected = s.iso === selectedIso;
          const timePart = s.label.split(", ")[1] ?? s.label;
          return (
            <button
              key={s.iso}
              type="button"
              onClick={() => onSelect(s)}
              className={`px-2 py-2 text-xs rounded-md border transition-colors ${
                isSelected
                  ? "border-[#8a9a5a] bg-[#8a9a5a] text-white"
                  : "border-warm-200 text-warm-700 hover:border-[#8a9a5a] hover:bg-[#f5f7f0]"
              }`}
              aria-pressed={isSelected}
              aria-label={`Select: ${s.label}`}
            >
              {timePart}
            </button>
          );
        })}
      </div>
    </div>
  );
}
