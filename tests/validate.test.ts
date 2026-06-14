import { describe, it, expect } from "vitest";
import { isVoiceFaithful, isAnswerGrounded } from "@/ai/validate";
import { decideVerdict } from "@/domain/verdict-engine";
import { fallbackVerdictVoice } from "@/ai/fallback-voice";
import type { Prices } from "@/domain/types";

const prices: Prices = { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 };
// Hero bridge: bridge 12 L, RM23.88, save RM58.24, reset in 6 days.
const hero = decideVerdict({
  gradeConsidering: "RON95", eligible: true, quotaCap: 200, quotaLitresLeft: 12,
  dailyBurn: 2, tankLevelLitres: 0, tankCapacityLitres: 40,
  daysToSubsidyReset: 6, daysToFloatReset: 2, prices, config: { reserveDays: 2 },
});

describe("isVoiceFaithful — code owns substance (ADR-0002)", () => {
  it("accepts the deterministic fallback voice (every figure is computed)", () => {
    expect(isVoiceFaithful(fallbackVerdictVoice(hero), hero)).toBe(true);
  });

  it("accepts a natural rephrasing that uses only the computed figures", () => {
    const text = "Don't fill up — just put in 12 L now (RM23.88) and you'll save RM58.24 after the 1st.";
    expect(isVoiceFaithful(text, hero)).toBe(true);
  });

  it("rejects a fabricated (inflated) ringgit saving", () => {
    const text = "Bridge 12 L now (RM23.88) and save RM999.00!";
    expect(isVoiceFaithful(text, hero)).toBe(false);
  });

  it("rejects a wrong litre figure", () => {
    const text = "Put in 40 L now (RM23.88), save RM58.24.";
    expect(isVoiceFaithful(text, hero)).toBe(false);
  });

  it("ignores non-substantive numbers like 'the 1st' and 'RON95'", () => {
    const text = "Top up just 12 L of RON95 now (RM23.88); fresh quota lands on the 1st. Save RM58.24.";
    expect(isVoiceFaithful(text, hero)).toBe(true);
  });
});

describe("isAnswerGrounded — Ask JimatJalan numbers stay code-validated", () => {
  // The driver's real state: RM25 subsidy left, ~12 L, burns 2 L/day.
  const allowed = { ringgit: [25, 58.24], litres: [12, 34] };

  it("accepts an answer that only cites state figures", () => {
    const text = "You've got about RM25 of subsidy left and 12 L of quota — sit tight.";
    expect(isAnswerGrounded(text, allowed)).toBe(true);
  });

  it("rejects an answer that invents a ringgit figure", () => {
    const text = "Driving to JB will cost you RM250 in fuel.";
    expect(isAnswerGrounded(text, allowed)).toBe(false);
  });

  it("accepts an answer with no figures at all (qualitative advice)", () => {
    const text = "Honestly, take the bus — it'll be cheaper and less hassle.";
    expect(isAnswerGrounded(text, allowed)).toBe(true);
  });
});
