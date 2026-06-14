import { describe, it, expect } from "vitest";
import { analyzeEfficiency } from "@/domain/efficiency-analyzer";
import type { Fill, Prices } from "@/domain/types";

const prices: Prices = { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 };
const CO2 = 2.31; // kg/L petrol

const fill = (over: Partial<Fill>): Fill => ({
  id: "f", vehicleId: "v", litres: 10, ringgit: 0, grade: "RON95",
  odometerKm: 0, at: "2026-06-01T00:00:00Z", ...over,
});

describe("analyzeEfficiency — the third pillar (CONTEXT.md Efficiency Read)", () => {
  const pair: [Fill, Fill] = [
    fill({ odometerKm: 45000 }),
    fill({ litres: 12, ringgit: 23.88, odometerKm: 45160, grade: "RON95" }),
  ];

  it("computes real L/100km from the fill pair (litres ÷ odometer gap)", () => {
    const r = analyzeEfficiency({ fillPair: pair, baselineL100: 6.4, prices, co2PerLitreKg: CO2 });
    expect(r.l100).toBeCloseTo(7.5, 5); // 12 L over 160 km
  });

  it("shows deviation % above the baseline", () => {
    const r = analyzeEfficiency({ fillPair: pair, baselineL100: 6.4, prices, co2PerLitreKg: CO2 });
    expect(r.deviationPct).toBeCloseTo(17.19, 1);
  });

  it("reports wasted ringgit and CO₂ together, priced at what the driver actually paid", () => {
    const r = analyzeEfficiency({ fillPair: pair, baselineL100: 6.4, prices, co2PerLitreKg: CO2 });
    // wasted ≈ 12 − (6.4/100 × 160) = 1.76 L; × RM1.99/L ≈ 3.50; × 2.31 ≈ 4.07 kg
    expect(r.wastedRinggit).toBeCloseTo(3.5, 1);
    expect(r.wastedCo2Kg).toBeCloseTo(4.07, 1);
  });

  it("offers likely causes from the bounded menu when over the baseline", () => {
    const r = analyzeEfficiency({ fillPair: pair, baselineL100: 6.4, prices, co2PerLitreKg: CO2, driverType: "private" });
    expect(r.causeCandidates.length).toBeGreaterThan(0);
    // every candidate is from the fixed menu — never a free-styled cause (ADR-0002)
    const MENU = ["tyre pressure", "hard acceleration", "idling", "AC load", "short trips", "cargo"];
    for (const c of r.causeCandidates) expect(MENU).toContain(c);
  });

  it("personalises the causes by driver — a city e-hailing driver differs from a commuter", () => {
    // short city trips (private) vs long stop-go days (e-hailing) → different culprits
    const cityCommuter: [Fill, Fill] = [fill({ odometerKm: 0 }), fill({ litres: 12, ringgit: 23.88, odometerKm: 150 })]; // 8.0, short gap
    const longDays: [Fill, Fill] = [fill({ odometerKm: 0 }), fill({ litres: 40, ringgit: 79.6, odometerKm: 500 })]; // 8.0, long gap
    const a = analyzeEfficiency({ fillPair: cityCommuter, baselineL100: 6.4, prices, co2PerLitreKg: CO2, driverType: "private" });
    const r = analyzeEfficiency({ fillPair: longDays, baselineL100: 6.4, prices, co2PerLitreKg: CO2, driverType: "ehailing" });
    expect(a.causeCandidates).not.toEqual(r.causeCandidates);
  });

  it("flags no waste and no causes when at or below the baseline", () => {
    const efficient: [Fill, Fill] = [
      fill({ odometerKm: 0 }),
      fill({ litres: 10, ringgit: 19.9, odometerKm: 200, grade: "RON95" }), // 5.0 L/100km
    ];
    const r = analyzeEfficiency({ fillPair: efficient, baselineL100: 6.4, prices, co2PerLitreKg: CO2, driverType: "private" });
    expect(r.wastedRinggit).toBe(0);
    expect(r.wastedCo2Kg).toBe(0);
    expect(r.causeCandidates).toEqual([]);
  });
});
