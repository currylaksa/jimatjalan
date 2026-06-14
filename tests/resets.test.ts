import { describe, it, expect } from "vitest";
import { nextMonthlyReset, nextWeeklyReset, daysUntil } from "@/domain/resets";

// Dates use UTC to keep the math deterministic across machines.
const d = (s: string) => new Date(s + "T00:00:00Z");

describe("nextMonthlyReset", () => {
  it("returns the 1st of next month from mid-month", () => {
    expect(nextMonthlyReset(d("2026-06-14"))).toEqual(d("2026-07-01"));
  });

  it("returns the 1st of next month when already on the 1st (no rollover, next cycle)", () => {
    expect(nextMonthlyReset(d("2026-06-01"))).toEqual(d("2026-07-01"));
  });

  it("rolls across a year boundary", () => {
    expect(nextMonthlyReset(d("2026-12-20"))).toEqual(d("2027-01-01"));
  });
});

describe("nextWeeklyReset", () => {
  it("returns the next Wednesday from a Monday", () => {
    // 2026-06-15 is a Monday → next Wednesday is 2026-06-17
    expect(nextWeeklyReset(d("2026-06-15"))).toEqual(d("2026-06-17"));
  });

  it("returns the following Wednesday when today is Wednesday", () => {
    // 2026-06-17 is a Wednesday → next reprice is 2026-06-24
    expect(nextWeeklyReset(d("2026-06-17"))).toEqual(d("2026-06-24"));
  });

  it("returns the next Wednesday from a Thursday", () => {
    // 2026-06-18 is a Thursday → next Wednesday is 2026-06-24
    expect(nextWeeklyReset(d("2026-06-18"))).toEqual(d("2026-06-24"));
  });
});

describe("daysUntil", () => {
  it("counts whole days between two dates", () => {
    expect(daysUntil(d("2026-06-14"), d("2026-07-01"))).toBe(17);
  });

  it("is zero for the same day", () => {
    expect(daysUntil(d("2026-06-14"), d("2026-06-14"))).toBe(0);
  });
});
