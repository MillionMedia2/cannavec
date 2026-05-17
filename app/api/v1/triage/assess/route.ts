// Triage Skill — Verdict Endpoint
// --------------------------------
// Thin wrapper around assessEligibility(). Takes the patient's answers,
// returns the green/amber/red verdict with reasons, flags, and (if red) a signpost.
//
// Server-side so the verdict engine logic is never bundled into the client JS.

import { NextRequest, NextResponse } from "next/server";
import { assessEligibility, type TriageAnswers, type Verdict } from "@/lib/triage/eligibility";

export interface AssessRequest {
  answers: TriageAnswers;
}

export interface AssessResponse {
  verdict: Verdict;
}

export async function POST(request: NextRequest) {
  let body: AssessRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !body.answers) {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  // Minimal shape check — full validation already happened in the wizard.
  const a = body.answers as Partial<TriageAnswers>;
  if (!a.condition || !a.personalDetails) {
    return NextResponse.json({ error: "answers is incomplete" }, { status: 400 });
  }

  try {
    const verdict = assessEligibility(body.answers);
    const response: AssessResponse = { verdict };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[triage/assess] error:", err);
    return NextResponse.json({ error: "Could not assess eligibility" }, { status: 500 });
  }
}
