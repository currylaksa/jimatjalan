// The Verdict engine — crown jewel (ADR-0001 "single engine, two clocks").
// Lifted verbatim in logic from the validated prototype
// (.scratch/jimatjalan/prototypes/verdict-engine/verdict-engine.mjs).
//
// PURE: no I/O, no Date.now(). Days-to-reset are passed IN — the `resets`
// module owns date math. Code owns every litre and ringgit figure (ADR-0002);
// the LLM later only voices the returned decision.

import type { FuelGrade, Prices } from "./types";

export type VerdictAction = "wait" | "bridge" | "bank" | "fill";
export type VerdictRegime = "subsidy" | "float";
export type ResetClock = "month" | "week";

/** Bounded enum — the LLM voices it, never originates it (ADR-0002). */
export type ReasonCode =
  | "TANK_FINE_RIDE_SUBSIDY"
  | "FLOAT_TANK_FINE"
  | "BRIDGE_RIDE_TO_RESET"
  | "MINIMISE_MARKET_BEFORE_RESET"
  | "FILL_NEEDED_NOW"
  | "BANK_EXPIRING_SUBSIDY"
  | "FLOAT_BRIDGE_TO_REPRICE";

export interface VerdictScenario {
  gradeConsidering: FuelGrade;
  /** BUDI95 eligible. */
  eligible: boolean;
  /** Monthly subsidised-litre ceiling (context for "constrained"). */
  quotaCap: number;
  /** Current Quota Balance (subsidised RON95 litres left this month). */
  quotaLitresLeft: number;
  dailyBurn: number;
  tankLevelLitres: number;
  tankCapacityLitres: number;
  /** Clock 1: days to the 1st (from `resets`). */
  daysToSubsidyReset: number;
  /** Clock 2: days to the next Wednesday reprice (from `resets`). */
  daysToFloatReset: number;
  prices: Prices;
  /** Tank counts as "low" below this many days of burn. */
  config: { reserveDays: number };
}

export interface VerdictDecision {
  regime: VerdictRegime;
  resetClock: ResetClock;
  daysToReset: number;
  projectedNeed: number;
  action: VerdictAction;
  recommendLitresNow: number;
  /** Present only in the subsidy fill/bridge branch (blended price breakdown). */
  subsidisedNow?: number;
  marketNow?: number;
  /** null = blended (show the subsidised+market breakdown instead). */
  pricePerLitreNow: number | null;
  ringgitNow: number;
  /** number in subsidy regime; null in float — no forecast, no honest saving (ADR-0001). */
  ringgitSaved: number | null;
  reasonCode: ReasonCode;
  carbonClaimable: false;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function decideVerdict(s: VerdictScenario): VerdictDecision {
  const priceDelta = s.prices.ron95Market - s.prices.subsidised;

  // ── Regime selection: subsidy only when RON95 + eligible + quota remains ──
  const inSubsidy =
    s.gradeConsidering === "RON95" && s.eligible && s.quotaLitresLeft > 0;
  const regime: VerdictRegime = inSubsidy ? "subsidy" : "float";
  const resetClock: ResetClock = inSubsidy ? "month" : "week";
  const daysToReset = inSubsidy ? s.daysToSubsidyReset : s.daysToFloatReset;

  const marketForGrade =
    s.gradeConsidering === "RON97"
      ? s.prices.ron97
      : s.gradeConsidering === "diesel"
        ? s.prices.diesel
        : s.prices.ron95Market;

  // ── Derived state ──
  const tankSpace = Math.max(0, s.tankCapacityLitres - s.tankLevelLitres);
  const projectedNeed = s.dailyBurn * daysToReset; // litres to consume before reset
  const neededNow = Math.max(0, projectedNeed - s.tankLevelLitres); // litres to ADD to reach reset
  const reserve = s.config.reserveDays * s.dailyBurn;
  const tankLow = s.tankLevelLitres < reserve;

  const base = {
    regime,
    resetClock,
    daysToReset,
    projectedNeed: round(projectedNeed),
    carbonClaimable: false as const,
  };

  // ── FLOAT REGIME (RON97 / diesel / ineligible / quota exhausted) ──
  // Reset clock = next Wednesday. We DO NOT forecast direction → no saving claim.
  if (!inSubsidy) {
    if (!tankLow) {
      return {
        ...base,
        action: "wait",
        recommendLitresNow: 0,
        pricePerLitreNow: marketForGrade,
        ringgitNow: 0,
        ringgitSaved: null, // float never claims a saving — no forecast (ADR-0001)
        reasonCode: "FLOAT_TANK_FINE",
      };
    }
    const fillNow = Math.min(neededNow, tankSpace);
    return {
      ...base,
      action: "bridge",
      recommendLitresNow: round(fillNow),
      pricePerLitreNow: marketForGrade,
      ringgitNow: round(fillNow * marketForGrade),
      ringgitSaved: null, // honest: a new price posts on a known date, but we don't predict it
      reasonCode: "FLOAT_BRIDGE_TO_REPRICE",
    };
  }

  // ── SUBSIDY REGIME ──
  const monthlyBurn = s.dailyBurn * 30;
  const subsidyConstrained = monthlyBurn > s.quotaCap; // burns more than the cap → every subsidised litre matters
  const surplus = Math.max(0, s.quotaLitresLeft - projectedNeed); // subsidy that will expire unused

  // (1) USE-IT-OR-LOSE-IT: surplus subsidy expiring AND user is subsidy-constrained.
  if (subsidyConstrained && surplus > 0 && tankSpace > 0) {
    const bankLitres = Math.min(tankSpace, surplus);
    return {
      ...base,
      action: "bank",
      recommendLitresNow: round(bankLitres),
      pricePerLitreNow: s.prices.subsidised,
      ringgitNow: round(bankLitres * s.prices.subsidised),
      ringgitSaved: round(bankLitres * priceDelta),
      reasonCode: "BANK_EXPIRING_SUBSIDY",
    };
  }

  // (2) Tank is fine → don't fill, ride the subsidy.
  if (!tankLow) {
    return {
      ...base,
      action: "wait",
      recommendLitresNow: 0,
      pricePerLitreNow: s.prices.subsidised,
      ringgitNow: 0,
      ringgitSaved: 0,
      reasonCode: "TANK_FINE_RIDE_SUBSIDY",
    };
  }

  // (3) Tank is low → ONE rule: fill only what you need to reach the reset.
  const fillNow = Math.min(neededNow, tankSpace);
  const subsidisedNow = Math.min(fillNow, s.quotaLitresLeft);
  const marketNow = Math.max(0, fillNow - subsidisedNow);
  const ringgitNow = subsidisedNow * s.prices.subsidised + marketNow * s.prices.ron95Market;

  // Naive alternative a normal driver does: fill the WHOLE tank right now.
  const naiveSubsidised = Math.min(tankSpace, s.quotaLitresLeft);
  const naiveMarket = Math.max(0, tankSpace - naiveSubsidised);
  const deferredMarketLitres = Math.max(0, naiveMarket - marketNow); // bought subsidised post-reset instead
  const ringgitSaved = deferredMarketLitres * priceDelta;

  const subsidyCoversSurvival = s.quotaLitresLeft >= neededNow;
  return {
    ...base,
    action: ringgitSaved > 0 ? "bridge" : "fill",
    recommendLitresNow: round(fillNow),
    subsidisedNow: round(subsidisedNow),
    marketNow: round(marketNow),
    pricePerLitreNow: marketNow === 0 ? s.prices.subsidised : null, // null = blended (show breakdown)
    ringgitNow: round(ringgitNow),
    ringgitSaved: round(ringgitSaved),
    reasonCode:
      ringgitSaved > 0
        ? subsidyCoversSurvival
          ? "BRIDGE_RIDE_TO_RESET"
          : "MINIMISE_MARKET_BEFORE_RESET"
        : "FILL_NEEDED_NOW",
  };
}
