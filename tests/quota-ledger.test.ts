import { describe, it, expect } from "vitest";
import { computeQuotaBalance } from "@/domain/quota-ledger";
import type { Fill, Prices } from "@/domain/types";

const prices: Prices = { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 };
const DELTA = 4.07 - 1.99; // 2.08
const today = new Date("2026-06-14T00:00:00Z");

const fill = (over: Partial<Fill>): Fill => ({
  id: "f", vehicleId: "v", litres: 10, ringgit: 0, grade: "RON95",
  odometerKm: 0, at: "2026-06-10T00:00:00Z", ...over,
});

describe("computeQuotaBalance", () => {
  it("starts from the full quota cap when there is no anchor and no fills", () => {
    const b = computeQuotaBalance({ fills: [], quotaCap: 200, prices, today });
    expect(b.litresLeft).toBe(200);
    expect(b.subsidyRinggit).toBeCloseTo(200 * DELTA, 5);
    expect(b.daysToReset).toBe(17); // to 2026-07-01
  });

  it("decrements by RON95 litres filled this month", () => {
    const b = computeQuotaBalance({
      fills: [fill({ litres: 30, grade: "RON95" })], quotaCap: 200, prices, today,
    });
    expect(b.litresLeft).toBe(170);
    expect(b.subsidyRinggit).toBeCloseTo(170 * DELTA, 5);
  });

  it("ignores RON97 and diesel fills (subsidy is RON95-only)", () => {
    const b = computeQuotaBalance({
      fills: [fill({ litres: 30, grade: "RON97" }), fill({ litres: 20, grade: "diesel" })],
      quotaCap: 200, prices, today,
    });
    expect(b.litresLeft).toBe(200);
  });

  it("ignores fills from a previous quota month when there is no anchor", () => {
    const b = computeQuotaBalance({
      fills: [fill({ litres: 40, at: "2026-05-28T00:00:00Z" })], quotaCap: 200, prices, today,
    });
    expect(b.litresLeft).toBe(200);
  });

  it("projects forward from an anchor, counting only fills after it", () => {
    const b = computeQuotaBalance({
      anchor: { quotaLitres: 50, at: "2026-06-12T00:00:00Z" },
      fills: [
        fill({ litres: 100, at: "2026-06-11T00:00:00Z" }), // before anchor → ignored
        fill({ litres: 12, at: "2026-06-13T00:00:00Z" }),  // after anchor → counts
      ],
      quotaCap: 200, prices, today,
    });
    expect(b.litresLeft).toBe(38);
  });

  it("clamps at zero when over-consumed", () => {
    const b = computeQuotaBalance({
      fills: [fill({ litres: 250 })], quotaCap: 200, prices, today,
    });
    expect(b.litresLeft).toBe(0);
    expect(b.subsidyRinggit).toBe(0);
  });
});
