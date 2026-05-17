// Triage Skill — Booking Endpoint
// --------------------------------
// Creates an Airtable record in the Appointments table for the patient's booking.
// (Replaced Google Calendar in T-3 due to Workspace permission restrictions —
// see knowledge/cannabis/projects/Triage Agent/tracker.md issue #6.)
//
// Same request/response shape as the T-2 stub, so the wizard UI is unchanged.

import { NextRequest, NextResponse } from "next/server";
import { createTriageRecord } from "@/lib/triage/airtable";
import type { TriageAnswers, Verdict } from "@/lib/triage/eligibility";

export interface BookRequest {
  answers: TriageAnswers;
  verdict: Verdict;
  /** ISO 8601 datetime string for preferred slot, or null for "any time". */
  preferredSlot: string | null;
  /** Human-readable slot label e.g. "Mon 19 May, 10:00 AM", or null. */
  preferredSlotLabel: string | null;
  /** GDPR consent — must be true. */
  consent: boolean;
}

export interface BookResponse {
  bookingId: string;
  slot: string | null;
  placeholder: boolean;
}

export async function POST(request: NextRequest) {
  let body: BookRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json({ error: "Consent is required before booking" }, { status: 400 });
  }
  if (!body.answers || !body.verdict) {
    return NextResponse.json({ error: "answers and verdict are required" }, { status: 400 });
  }
  if (body.verdict.status === "red") {
    return NextResponse.json({ error: "Cannot book — verdict is red" }, { status: 400 });
  }

  try {
    const result = await createTriageRecord({
      answers: body.answers,
      verdict: body.verdict,
      preferredSlotLabel: body.preferredSlotLabel,
    });

    const response: BookResponse = {
      bookingId: result.recordId,
      slot: body.preferredSlot,
      placeholder: body.preferredSlot === null,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[triage/book] Airtable record creation failed:", err);
    return NextResponse.json(
      { error: "Couldn't save the booking. Please try again in a moment." },
      { status: 500 },
    );
  }
}
