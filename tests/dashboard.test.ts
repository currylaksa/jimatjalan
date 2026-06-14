import { describe, it, expect } from "vitest";
import { monthlyStats } from "@/domain/dashboard";
import type { Prices } from "@/domain/types";

const prices: Prices = { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 };

describe("monthlyStats — unified dashboard numbers (module 5)", () => {
  it("computes monthly litres, cost/km, monthly CO₂ and trees-to-offset", () => {
    const s = monthlyStats({ dailyBurn: 2, effL100: 7.5, prices, co2PerLitreKg: 2.31 });
    expect(s.monthlyLitres).toBeCloseTo(60, 5); // 2 × 30
    expect(s.costPerKm).toBeCloseTo(0.15, 2); // 7.5/100 × RM1.99
    expect(s.monthlyCo2Kg).toBeCloseTo(138.6, 1); // 60 × 2.31
    expect(s.treesPerYear).toBe(79); // 138.6 × 12 / 21
  });

  it("falls back to baseline efficiency when no tank read yet", () => {
    const s = monthlyStats({ dailyBurn: 2, effL100: null, baselineL100: 6.4, prices, co2PerLitreKg: 2.31 });
    expect(s.costPerKm).toBeCloseTo(0.13, 2); // 6.4/100 × 1.99
  });
});
