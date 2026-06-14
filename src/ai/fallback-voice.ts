// Deterministic verdict voice. Numbers come straight from the decision object —
// code owns substance (ADR-0002). Used as the placeholder voice in issue 04 and
// as the never-blank fallback when the LLM call fails (issue 06). Pure, no
// secrets — safe to import on the client.

import type { VerdictDecision } from "@/domain/verdict-engine";

const rm = (n: number | null) => (n == null ? "—" : `RM${n.toFixed(2)}`);
const L = (n: number) => `${n} L`;

/** A short, opinionated verdict line keyed to the bounded reasonCode. */
export function fallbackVerdictVoice(d: VerdictDecision): string {
  switch (d.reasonCode) {
    case "TANK_FINE_RIDE_SUBSIDY":
      return "Tank's fine and you've subsidised fuel to spare. Don't fill today.";
    case "FLOAT_TANK_FINE":
      return "Tank's fine. No timing edge this week — don't fill today.";
    case "BRIDGE_RIDE_TO_RESET":
      return `Don't fill up. Put in just ${L(d.recommendLitresNow)} subsidised now (${rm(d.ringgitNow)}); fill fully after the 1st. Save ${rm(d.ringgitSaved)}.`;
    case "MINIMISE_MARKET_BEFORE_RESET":
      return `Fill only ${L(d.recommendLitresNow)} now, not the whole tank — fresh subsidy lands on the 1st. Save ${rm(d.ringgitSaved)} vs a full fill.`;
    case "FILL_NEEDED_NOW":
      return `You genuinely need fuel and your quota can't bridge to the reset. Fill ${L(d.recommendLitresNow)} now (${rm(d.ringgitNow)}).`;
    case "BANK_EXPIRING_SUBSIDY":
      return `Top up ${L(d.recommendLitresNow)} today even though your tank isn't empty — ${rm(d.ringgitSaved)} of subsidy expires in ${d.daysToReset} day(s). Bank it.`;
    case "FLOAT_BRIDGE_TO_REPRICE":
      return `A new price posts in ${d.daysToReset} day(s). Bridge just ${L(d.recommendLitresNow)} now (${rm(d.ringgitNow)}); we don't predict the move.`;
  }
}
