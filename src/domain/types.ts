// Core domain types. See docs/architecture.md and CONTEXT.md.

export type FuelGrade = "RON95" | "RON97" | "diesel";
export type DriverType = "private" | "ehailing" | "gig";

export interface Prices {
  /** Subsidised BUDI95 RON95 price, RM/L. Seed/config, not a constant. */
  subsidised: number;
  /** Unsubsidised RON95 market float, RM/L. */
  ron95Market: number;
  ron97: number;
  diesel: number;
}

export interface Vehicle {
  id: string;
  makeModel: string;
  tankCapacityLitres: number;
  baselineSpecL100: number;
  driverType: DriverType;
}

export interface Fill {
  id: string;
  vehicleId: string;
  litres: number;
  ringgit: number;
  grade: FuelGrade;
  odometerKm: number;
  /** ISO timestamp. */
  at: string;
}

export interface Anchor {
  /** Known remaining subsidised litres at the moment of anchoring. */
  quotaLitres: number;
  /** ISO timestamp. */
  at: string;
}

export interface QuotaConfig {
  /** Monthly subsidised-litre ceiling, keyed to driver type. Config, not branching logic. */
  quotaCap: number;
  prices: Prices;
  /** kg CO₂ per litre burned (~2.31 petrol / ~2.68 diesel). Feeds the Efficiency Read. */
  co2PerLitreKg: number;
}

export interface Profile {
  /** Onboarding km/day self-report → seeds Daily Burn (CONTEXT.md). */
  selfReportKmPerDay: number;
  /** Seeded default Tank Level guess; the Verdict surfaces it as adjustable. */
  tankLevelLitres: number;
}

export interface QuotaBalance {
  litresLeft: number;
  /** Value of the remaining subsidy in ringgit = litresLeft × (market − subsidised). */
  subsidyRinggit: number;
  daysToReset: number;
}
