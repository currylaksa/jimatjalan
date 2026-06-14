// Consumption model — Daily Burn. Seeded for the MVP (CONTEXT.md "Daily Burn").
// Pure: all state passed in. Tank Level is a seeded, user-adjustable guess
// (CONTEXT.md time-box fallback), so no running tank model lives here.

import type { Fill } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface DailyBurnInput {
  /** Onboarding self-report (CONTEXT.md). Preferred when present. */
  selfReportKmPerDay?: number;
  /** Vehicle real-world L/100km (the Baseline spec). */
  vehicleEfficiencyL100: number;
  fills: Fill[];
}

/** Litres/day. Self-report drives it from minute one; else observed fill cadence. */
export function estimateDailyBurn(i: DailyBurnInput): number {
  if (i.selfReportKmPerDay != null) {
    return (i.selfReportKmPerDay * i.vehicleEfficiencyL100) / 100;
  }

  // Observed: litres refilled after the first fill ≈ litres burned over the span.
  if (i.fills.length >= 2) {
    const sorted = [...i.fills].sort((a, b) => +new Date(a.at) - +new Date(b.at));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const days = (+new Date(last.at) - +new Date(first.at)) / MS_PER_DAY;
    const litres = sorted.slice(1).reduce((sum, f) => sum + f.litres, 0);
    if (days > 0) return litres / days;
  }

  throw new Error("estimateDailyBurn: need a self-report or ≥2 dated fills");
}
