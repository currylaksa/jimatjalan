// Efficiency Read — the third hero pillar (CONTEXT.md). One fill-to-fill interval
// → real L/100km vs Baseline, surfacing wasted ringgit AND CO₂ (money leads),
// plus likely causes chosen from a BOUNDED menu — never an LLM-freestyled cause
// (ADR-0002). Pure; all state passed in.

import type { Fill, Prices, DriverType } from "./types";

interface Input {
  /** [earlier fill, later fill] — both with odometer readings. */
  fillPair: [Fill, Fill];
  baselineL100: number;
  prices: Prices;
  /** ~2.31 petrol / ~2.68 diesel. */
  co2PerLitreKg: number;
  /** Personalises the likely causes; defaults to a private driver. */
  driverType?: DriverType;
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

// Rank the bounded menu by honest, coarse signals (driver type + trip length +
// how far over baseline) so the likely causes — and the eco-tips — differ per
// driver. Still "likely culprits", never an asserted measurement (ADR-0002).
function selectCauses(deviationPct: number, gapKm: number, driverType: DriverType): string[] {
  const s: Record<string, number> = {
    "tyre pressure": 1, "hard acceleration": 0, idling: 0, "AC load": 1, "short trips": 0, cargo: 0,
  };
  const heavy = driverType === "ehailing" || driverType === "gig";
  if (heavy) { s.idling += 4; s["hard acceleration"] += 2; s["AC load"] += 2; }
  else { s["tyre pressure"] += 2; s["short trips"] += 1; }

  if (gapKm < 200) { s["short trips"] += 3; s.idling += 2; }     // lots of short city hops
  else if (gapKm > 400) { s["tyre pressure"] += 2; s.cargo += 2; s["hard acceleration"] += 1; } // highway legs

  if (deviationPct > 18) s["hard acceleration"] += 2;
  if (deviationPct > 30) { s.cargo += 1; s["AC load"] += 1; }

  const count = deviationPct > 15 ? 3 : 2;
  return [...CAUSE_MENU]
    .sort((a, b) => s[b] - s[a] || CAUSE_MENU.indexOf(a) - CAUSE_MENU.indexOf(b))
    .slice(0, count);
}

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
    causeCandidates: overTolerance ? selectCauses(deviationPct, gapKm, i.driverType ?? "private") : [],
  };
}
