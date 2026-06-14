// Baseline — the reference L/100km the Efficiency Read compares against.
// Hybrid (CONTEXT.md): seeded from a make/model spec, then migrates toward the
// driver's own rolling average as Fills accumulate. Pure; state passed in.

import type { Fill } from "./types";

interface Input {
  /** Real-world-corrected spec L/100km for the make/model. */
  makeModelSpecL100: number;
  personalFills: Fill[];
}

// One interval = one full-to-full leg; we need a couple before we trust personal
// data, so an honest driver isn't flagged off a single noisy reading.
const MIN_INTERVALS_TO_PERSONALISE = 2;
const FULL_CONFIDENCE_INTERVALS = 6;

const round = (n: number) => Math.round(n * 100) / 100;

/** L/100km for each consecutive fill pair (later fill's litres ÷ odometer gap). */
function intervalL100s(fills: Fill[]): number[] {
  const sorted = [...fills].sort((a, b) => +new Date(a.at) - +new Date(b.at));
  const out: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].odometerKm - sorted[i - 1].odometerKm;
    if (gap > 0) out.push((sorted[i].litres / gap) * 100);
  }
  return out;
}

export function resolveBaseline(i: Input): number {
  const intervals = intervalL100s(i.personalFills);
  if (intervals.length < MIN_INTERVALS_TO_PERSONALISE) return i.makeModelSpecL100;

  const personalAvg = intervals.reduce((s, n) => s + n, 0) / intervals.length;
  const w = Math.min(intervals.length, FULL_CONFIDENCE_INTERVALS) / FULL_CONFIDENCE_INTERVALS;
  return round(i.makeModelSpecL100 * (1 - w) + personalAvg * w);
}
