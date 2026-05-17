// Triage — Calendar Slot Generation
// ----------------------------------
// Generates Mon-Fri 9am-5pm candidate slots for the next 10 business days.
// All slots are shown as available — the clinic confirms when they call back.
//
// Note: freebusy filtering was removed when we switched from Google Calendar
// to Airtable for booking storage (tracker.md issue #6, 2026-05-17).

import type { CalendarSlot } from "./types";

const SLOT_INTERVAL_MINUTES = 30;
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 17; // last slot starts at 16:30
const BUSINESS_DAYS_AHEAD = 10;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

function formatSlotLabel(d: Date): string {
  const weekday = WEEKDAY_LABELS[d.getDay()];
  const month = MONTH_LABELS[d.getMonth()];
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute === 0 ? "00" : String(minute).padStart(2, "0");
  return `${weekday} ${day} ${month}, ${hour12}:${minuteStr} ${ampm}`;
}

/**
 * Build Mon-Fri 9am-5pm slots starting from the next business day.
 * All slots are marked available: true — no freebusy filtering.
 * The patient's chosen slot is stored as a preference in Airtable;
 * the clinic confirms via phone.
 */
export function generateSlots(from: Date = new Date()): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  let businessDaysCovered = 0;
  let cursor = new Date(start);

  while (businessDaysCovered < BUSINESS_DAYS_AHEAD) {
    if (isWeekday(cursor)) {
      for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
        for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
          const slotDate = new Date(cursor);
          slotDate.setHours(hour, minute, 0, 0);
          slots.push({
            iso: slotDate.toISOString(),
            label: formatSlotLabel(slotDate),
            available: true,
          });
        }
      }
      businessDaysCovered++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}

/**
 * Group slots by date for the day-panel layout in the picker UI.
 */
export function groupSlotsByDay(
  slots: CalendarSlot[],
): { dayLabel: string; slots: CalendarSlot[] }[] {
  const map = new Map<string, CalendarSlot[]>();
  for (const s of slots) {
    const d = new Date(s.iso);
    const key = `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
    const existing = map.get(key);
    if (existing) existing.push(s);
    else map.set(key, [s]);
  }
  return Array.from(map.entries()).map(([dayLabel, slots]) => ({ dayLabel, slots }));
}
