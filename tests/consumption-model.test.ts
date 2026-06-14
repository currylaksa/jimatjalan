import { describe, it, expect } from "vitest";
import { estimateDailyBurn } from "@/domain/consumption-model";
import type { Fill } from "@/domain/types";

const fill = (over: Partial<Fill>): Fill => ({
  id: "f", vehicleId: "v", litres: 10, ringgit: 0, grade: "RON95",
  odometerKm: 0, at: "2026-06-10T00:00:00Z", ...over,
});

describe("estimateDailyBurn", () => {
  it("uses the onboarding self-report (km/day × efficiency) when given", () => {
    // 31.25 km/day × 6.4 L/100km = 2.0 L/day
    const burn = estimateDailyBurn({ selfReportKmPerDay: 31.25, vehicleEfficiencyL100: 6.4, fills: [] });
    expect(burn).toBeCloseTo(2.0, 5);
  });

  it("falls back to observed fill cadence when there is no self-report", () => {
    // Burned ≈ what was refilled (12 L) over the 10-day gap between fills → 1.2 L/day.
    const burn = estimateDailyBurn({
      vehicleEfficiencyL100: 6.4,
      fills: [
        fill({ litres: 30, at: "2026-06-02T00:00:00Z" }),
        fill({ litres: 12, at: "2026-06-12T00:00:00Z" }),
      ],
    });
    expect(burn).toBeCloseTo(1.2, 5);
  });
});
