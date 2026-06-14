// POST /api/ask — Ask JimatJalan. Server-side; the Claude key never reaches the
// client. The verdict is recomputed here from the scenario (substance is
// server-authoritative), and the answer's figures are validated against the
// computed state before it's returned (ADR-0002).
import { NextResponse } from "next/server";
import { decideVerdict } from "@/domain/verdict-engine";
import type { VerdictScenario } from "@/domain/verdict-engine";
import { computeTripCosts } from "@/domain/trip-costs";
import { askAdvisor, type AdvisorState } from "@/ai/llm-voice";

interface Body {
  scenario: VerdictScenario;
  baselineL100: number;
  vehicle: string;
  question: string;
}

export async function POST(req: Request) {
  const { scenario, baselineL100, vehicle, question } = (await req.json()) as Body;
  const d = decideVerdict(scenario);
  const { prices } = scenario;

  const state: AdvisorState = {
    vehicle,
    regime: d.regime,
    quotaLitresLeft: scenario.quotaLitresLeft,
    subsidyRinggit: scenario.quotaLitresLeft * (prices.ron95Market - prices.subsidised),
    dailyBurn: scenario.dailyBurn,
    projectedNeed: d.projectedNeed,
    baselineL100,
    daysToReset: d.daysToReset,
    prices,
    currentVerdict: {
      action: d.action,
      recommendLitresNow: d.recommendLitresNow,
      ringgitNow: d.ringgitNow,
      ringgitSaved: d.ringgitSaved,
      reasonCode: d.reasonCode,
    },
    // Real cost to drive each trip, at market RON95 (the true marginal cost).
    trips: computeTripCosts(baselineL100, prices.ron95Market),
  };

  const text = await askAdvisor(state, question);
  return NextResponse.json({ text });
}
