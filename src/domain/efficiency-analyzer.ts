// Efficiency Read — the third hero pillar (CONTEXT.md). One fill-to-fill interval
// → real L/100km vs Baseline, surfacing wasted ringgit AND CO₂ (money leads),
// plus likely causes chosen from a BOUNDED menu — never an LLM-freestyled cause
// (ADR-0002). Pure; all state passed in.

import type { Fill, Prices } from "./types";

interface Input {
  /** [earlier fill, later fill] — both with odometer readings. */
  fillPair: [Fill, Fill];
  baselineL100: number;
  prices: Prices;
  /** ~2.31 petrol / ~2.68 diesel. */
  co2PerLitreKg: number;
}

export interface EfficiencyResult {
  l100: number;
  deviationPct: number;
  wastedRinggit: number;
  wastedCo2Kg: number;
  causeCandidates: string[];
}

// The fixed cause menu — code picks from here, the LLM never invents one.
const CAUSE_MENU = ["tyre pressure", "hard acceleration", "idling", "AC load", "short trips", "cargo"];
// Real-world noise floor: within this % of baseline is "normal", not waste.
const TOLERANCE_PCT = 5;

const round = (n: number) => Math.round(n * 100) / 100;

export function analyzeEfficiency(i: Input): EfficiencyResult {
  const [a, b] = i.fillPair;
  const gapKm = b.odometerKm - a.odometerKm;
  const l100 = (b.litres / gapKm) * 100;
  const deviationPct = ((l100 - i.baselineL100) / i.baselineL100) * 100;

  // Litres burned beyond what the baseline would have used over this distance.
  const expectedLitres = (i.baselineL100 / 100) * gapKm;
  const wastedLitres = Math.max(0, b.litres - expectedLitres);
  const pricePaidPerLitre = b.ringgit / b.litres; // what the driver actually paid

  const overTolerance = deviationPct > TOLERANCE_PCT;

  return {
    l100: round(l100),
    deviationPct: round(deviationPct),
    wastedRinggit: round(wastedLitres * pricePaidPerLitre),
    wastedCo2Kg: round(wastedLitres * i.co2PerLitreKg),
    causeCandidates: overTolerance ? [...CAUSE_MENU] : [],
  };
}
