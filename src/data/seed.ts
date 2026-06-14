// The single pre-seeded Demo Account (CONTEXT.md "Demo Account").
// Tuned so the Wallet opens on the iconic state: 12 L left ≈ RM25 subsidy.
import type { Vehicle, Fill, Anchor, QuotaConfig, Profile } from "@/domain/types";

export const seedVehicle: Vehicle = {
  id: "veh-1",
  makeModel: "Perodua Myvi 1.5",
  tankCapacityLitres: 40,
  baselineSpecL100: 6.4,
  driverType: "private",
};

export const seedQuotaConfig: QuotaConfig = {
  quotaCap: 200, // private driver; e-hailing/gig would be 800 (config, not branching)
  prices: { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 },
  co2PerLitreKg: 2.31, // petrol Myvi; a diesel vehicle would be ~2.68
};

// Anchored at 24 L, then a 12 L RON95 fill → 12 L remaining ≈ RM25 subsidy.
export const seedAnchor: Anchor = { quotaLitres: 24, at: "2026-06-11T09:00:00Z" };

// Near-empty tank is why the driver opens the app ("Patut Isi?"). 31.25 km/day
// × 6.4 L/100km ≈ 2 L/day Daily Burn.
export const seedProfile: Profile = { selfReportKmPerDay: 31.25, tankLevelLitres: 3 };

export const seedFills: Fill[] = [
  // Earlier fill (before the anchor): ignored by the ledger, anchors the Efficiency Read.
  { id: "fill-1", vehicleId: "veh-1", litres: 30, ringgit: 59.7, grade: "RON95", odometerKm: 45000, at: "2026-06-02T08:30:00Z" },
  // Latest fill (after the anchor): decrements the Quota Balance to 12 L. Odometer
  // gap of 160 km on 12 L → 7.5 L/100km, a believable ~17% over the 6.4 baseline.
  { id: "fill-2", vehicleId: "veh-1", litres: 12, ringgit: 23.88, grade: "RON95", odometerKm: 45160, at: "2026-06-12T18:15:00Z" },
];

// ── Rahman — E-hailing persona (the high-pain wedge). Quota Cap 800, burns ~27
// L/day so monthly burn > cap (subsidy-constrained); lots of quota still left that
// will expire at the reset → a date-robust BANK ("use-it-or-lose-it") verdict.
export const rahmanVehicle: Vehicle = {
  id: "veh-r",
  makeModel: "Toyota Vios 1.5",
  tankCapacityLitres: 42,
  baselineSpecL100: 6.5,
  driverType: "ehailing",
};
export const rahmanQuotaConfig: QuotaConfig = {
  quotaCap: 800,
  prices: { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 },
  co2PerLitreKg: 2.31,
};
export const rahmanProfile: Profile = { selfReportKmPerDay: 415, tankLevelLitres: 8 };
export const rahmanAnchor: Anchor = { quotaLitres: 600, at: "2026-06-13T07:00:00Z" };
// Monthly spend history for the dashboard bar chart (RM, last 6 months).
export const seedMonthlySpend: { m: string; rm: number }[] = [
  { m: "Jan", rm: 238 }, { m: "Feb", rm: 215 }, { m: "Mar", rm: 268 },
  { m: "Apr", rm: 292 }, { m: "May", rm: 255 }, { m: "Jun", rm: 284 },
];

// Price monitoring (challenge #1). HISTORY + current, never a forecast (ADR-0001).
// Subsidised RON95 is fixed (BUDI95 quota price); the float grades move weekly.
export const seedLastWeekPrices = { subsidised: 1.99, ron95Market: 4.01, ron97: 4.75, diesel: 4.97 };
export const seedRon97Trend: { w: string; p: number }[] = [
  { w: "W1", p: 4.62 }, { w: "W2", p: 4.66 }, { w: "W3", p: 4.78 }, { w: "W4", p: 4.74 },
  { w: "W5", p: 4.66 }, { w: "W6", p: 4.55 }, { w: "W7", p: 4.79 }, { w: "W8", p: 4.85 },
];

export const rahmanFills: Fill[] = [
  { id: "rfill-1", vehicleId: "veh-r", litres: 40, ringgit: 79.6, grade: "RON95", odometerKm: 120000, at: "2026-06-06T07:00:00Z" },
  // 520 km gap on 38 L → 7.31 L/100km, ~12% over the 6.5 baseline.
  { id: "rfill-2", vehicleId: "veh-r", litres: 38, ringgit: 75.62, grade: "RON95", odometerKm: 120520, at: "2026-06-12T07:00:00Z" },
];
