// Onboarding reference data (CONTEXT.md): driver type → Quota Cap (config, not
// branching logic) and a small make/model table of real-world-corrected specs.
// Pure data + lookups; no I/O.

import type { DriverType } from "./types";

/** Monthly subsidised-litre ceiling per driver type — pure config feeding the engine. */
const QUOTA_CAP: Record<DriverType, number> = {
  private: 200,
  ehailing: 800,
  gig: 800,
};

export function quotaCapForDriver(driverType: DriverType): number {
  return QUOTA_CAP[driverType];
}

export interface VehicleSpec {
  /** Real-world-corrected L/100km (lab figure adjusted up). */
  baselineSpecL100: number;
  tankCapacityLitres: number;
}

/** Common Malaysian models. Lab economy nudged toward real-world driving. */
export const VEHICLE_SPECS: Record<string, VehicleSpec> = {
  "Perodua Myvi 1.5": { baselineSpecL100: 6.4, tankCapacityLitres: 40 },
  "Perodua Axia 1.0": { baselineSpecL100: 5.5, tankCapacityLitres: 36 },
  "Perodua Bezza 1.3": { baselineSpecL100: 6.0, tankCapacityLitres: 36 },
  "Proton Saga 1.3": { baselineSpecL100: 6.6, tankCapacityLitres: 40 },
  "Honda City 1.5": { baselineSpecL100: 6.2, tankCapacityLitres: 40 },
  "Toyota Vios 1.5": { baselineSpecL100: 6.5, tankCapacityLitres: 42 },
};

export const VEHICLE_MODELS = Object.keys(VEHICLE_SPECS);

export function specForModel(makeModel: string): VehicleSpec {
  return VEHICLE_SPECS[makeModel] ?? VEHICLE_SPECS["Perodua Myvi 1.5"];
}
