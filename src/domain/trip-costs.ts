// Grounded trip fuel costs (for Ask JimatJalan). Code owns the number: fuel cost
// for a known distance at the driver's real baseline + price (ADR-0002), so the
// advisor can answer "drive to JB or take the bus?" with a validated figure.
// Distances are one-way from KL (approx).

export interface Trip {
  name: string;
  km: number;
}

export const COMMON_TRIPS: Trip[] = [
  { name: "Johor Bahru (JB)", km: 330 },
  { name: "Penang", km: 355 },
  { name: "Ipoh", km: 205 },
  { name: "Melaka", km: 145 },
];

export interface TripCost extends Trip {
  fuelCostRinggit: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Fuel cost per trip = km/100 × baseline L/100km × price RM/L. */
export function computeTripCosts(baselineL100: number, pricePerLitre: number): TripCost[] {
  return COMMON_TRIPS.map((t) => ({
    ...t,
    fuelCostRinggit: round((t.km / 100) * baselineL100 * pricePerLitre),
  }));
}
