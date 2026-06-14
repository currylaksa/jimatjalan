// The LLM voice boundary — SERVER ONLY (the Claude key never reaches the client).
// Code owns substance; the LLM owns voice (ADR-0002). Every returned line is
// number-validated against the computed decision, and any failure — bad figures,
// a thrown call, or a missing key — degrades to the deterministic voice, never blank.
import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { VerdictDecision } from "@/domain/verdict-engine";
import type { Prices } from "@/domain/types";
import { fallbackVerdictVoice } from "./fallback-voice";
import { isVoiceFaithful, isAnswerGrounded } from "./validate";
import {
  VERDICT_SYSTEM,
  verdictUserPrompt,
  ADVISOR_SYSTEM,
  advisorUserPrompt,
} from "./prompts";

// Haiku 4.5 for cheap short voice lines. NOTE: Haiku 4.5 does not accept
// `output_config.effort` or adaptive `thinking` (both 400) — keep the calls plain.
const MODEL = "claude-haiku-4-5";
const round = (n: number) => Math.round(n * 100) / 100;

/** Render a decision into a human verdict line. Always returns something. */
export async function voiceVerdict(d: VerdictDecision): Promise<string> {
  const fallback = fallbackVerdictVoice(d);
  if (!process.env.ANTHROPIC_API_KEY) return fallback; // no key → deterministic voice

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: VERDICT_SYSTEM,
      messages: [{ role: "user", content: verdictUserPrompt(d) }],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    // Repair-by-fallback: if the model strays from the computed numbers, drop it.
    return text && isVoiceFaithful(text, d) ? text : fallback;
  } catch {
    return fallback; // flaky model / network → never break the stage
  }
}

export interface AdvisorState {
  vehicle: string;
  regime: string;
  quotaLitresLeft: number;
  subsidyRinggit: number;
  dailyBurn: number;
  projectedNeed: number;
  baselineL100: number;
  daysToReset: number;
  prices: Prices;
  currentVerdict: {
    action: string;
    recommendLitresNow: number;
    ringgitNow: number;
    ringgitSaved: number | null;
    reasonCode: string;
  };
  /** Code-computed fuel cost for common trips (grounds "drive to X?" questions). */
  trips: { name: string; km: number; fuelCostRinggit: number }[];
}

/** Grounded free-form advisor (Ask JimatJalan). Always returns something. */
export async function askAdvisor(state: AdvisorState, question: string): Promise<string> {
  // Numbers the answer is allowed to cite — state values + a few honest derivations.
  const v = state.currentVerdict;
  const ringgit = [
    state.subsidyRinggit,
    v.ringgitNow,
    ...(v.ringgitSaved != null ? [v.ringgitSaved, round(v.ringgitSaved * 4)] : []),
    state.prices.subsidised,
    state.prices.ron95Market,
    state.prices.ron97,
    state.prices.diesel,
    ...state.trips.map((t) => t.fuelCostRinggit),
    ...state.trips.map((t) => t.fuelCostRinggit * 2), // round trip
  ].map(round);
  const litres = [
    state.quotaLitresLeft,
    state.projectedNeed,
    state.dailyBurn,
    round(state.dailyBurn * 7),
    v.recommendLitresNow,
    Math.max(0, state.projectedNeed - state.quotaLitresLeft), // shortfall
  ].map(round);

  const recap =
    `Right now: ${round(state.quotaLitresLeft)} L of subsidised RON95 left ` +
    `(~RM${round(state.subsidyRinggit)} of subsidy), burning about ${round(state.dailyBurn)} L/day, ` +
    `${state.daysToReset} days to the reset.`;

  if (!process.env.ANTHROPIC_API_KEY) return recap;

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: ADVISOR_SYSTEM,
      messages: [{ role: "user", content: advisorUserPrompt(state, question) }],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    // Grounded → return it; ungrounded (a fabricated figure) → the safe recap.
    return text && isAnswerGrounded(text, { ringgit, litres }) ? text : recap;
  } catch {
    return recap;
  }
}
