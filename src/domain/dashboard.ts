// Unified dashboard numbers (module 5). Pure — honest arithmetic over usage.
import type { Prices } from "./types";

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const TREE_KG_PER_YEAR = 21; // a mature tree absorbs ~21 kg CO₂/yr

interface Input {
  dailyBurn: number;
  /** measured L/100km this tank, or null before a read */
  effL100: number | null;
  baselineL100?: number;
  prices: Prices;
  co2PerLitreKg: number;
}

export interface MonthlyStats {
  monthlyLitres: number;
  costPerKm: number;
  monthlyCo2Kg: number;
  treesPerYear: number;
}

export function monthlyStats(i: Input): MonthlyStats {
  const eff = i.effL100 ?? i.baselineL100 ?? 7;
  const monthlyLitres = i.dailyBurn * 30;
  const monthlyCo2Kg = monthlyLitres * i.co2PerLitreKg;
  return {
    monthlyLitres: round(monthlyLitres, 1),
    costPerKm: round((eff / 100) * i.prices.subsidised, 2),
    monthlyCo2Kg: round(monthlyCo2Kg, 1),
    treesPerYear: Math.round((monthlyCo2Kg * 12) / TREE_KG_PER_YEAR),
  };
}
