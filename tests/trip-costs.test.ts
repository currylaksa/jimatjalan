import { describe, it, expect } from "vitest";
import { computeTripCosts, COMMON_TRIPS } from "@/domain/trip-costs";

describe("computeTripCosts — grounded trip fuel cost for Ask JimatJalan", () => {
  it("computes fuel cost = km/100 × baseline × price per trip", () => {
    const trips = computeTripCosts(6.4, 4.07);
    const jb = trips.find((t) => t.name.includes("JB"));
    expect(jb).toBeDefined();
    // 330 km / 100 × 6.4 L/100km × RM4.07 = RM85.96
    expect(jb!.fuelCostRinggit).toBeCloseTo(85.96, 1);
  });

  it("returns one entry per common trip", () => {
    expect(computeTripCosts(6.4, 4.07)).toHaveLength(COMMON_TRIPS.length);
  });
});
