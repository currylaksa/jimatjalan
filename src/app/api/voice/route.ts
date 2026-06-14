// POST /api/voice — server-side verdict voicing. Recomputes the decision from
// the scenario here (substance is server-authoritative, ADR-0002) before voicing,
// so a tampered client payload can't smuggle in a number. Returns { text }.
import { NextResponse } from "next/server";
import { decideVerdict } from "@/domain/verdict-engine";
import type { VerdictScenario } from "@/domain/verdict-engine";
import { voiceVerdict } from "@/ai/llm-voice";

export async function POST(req: Request) {
  const scenario = (await req.json()) as VerdictScenario;
  const decision = decideVerdict(scenario);
  const text = await voiceVerdict(decision);
  return NextResponse.json({ text });
}
