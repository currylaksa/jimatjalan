import { describe, it, expect } from "vitest";
import { forecastSpend } from "@/domain/spend-forecast";
import type { Prices } from "@/domain/types";

const prices: Prices = { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 };

describe("forecastSpend — honest spend projection (not a price bet)", () => {
  it("projects spend to the reset, splitting subsidised vs market litres", () => {
    // burn 2 × 17 days = 34 L; 12 L subsidised (RM23.88) + 22 L market (RM89.54).
    const f = forecastSpend({ dailyBurn: 2, daysToReset: 17, quotaLitresLeft: 12, quotaCap: 200, prices });
    expect(f.litresToReset).toBeCloseTo(34, 5);
    expect(f.spendToReset).toBeCloseTo(113.42, 2);
  });

  it("projects a full next month against the fresh quota cap", () => {
    // burn 2 × 30 = 60 L, all under the 200 L cap → 60 × RM1.99 = RM119.40.
    const f = forecastSpend({ dailyBurn: 2, daysToReset: 17, quotaLitresLeft: 12, quotaCap: 200, prices });
    expect(f.nextMonthSpend).toBeCloseTo(119.4, 2);
  });

  it("prices over-cap litres at market (subsidy-constrained driver)", () => {
    // burn 30 × 30 = 900 L; 800 subsidised + 100 market.
    const f = forecastSpend({ dailyBurn: 30, daysToReset: 10, quotaLitresLeft: 600, quotaCap: 800, prices });
    expect(f.nextMonthSpend).toBeCloseTo(800 * 1.99 + 100 * 4.07, 2);
  });
});
