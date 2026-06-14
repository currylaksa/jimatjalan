// Spend forecast — predicts the driver's OWN fuel expense (brief: "predict next
// fuel expense"), NOT the price. Honest arithmetic over known burn + known price,
// splitting subsidised vs market litres (ADR-0001: we never forecast the price).
import type { Prices } from "./types";

interface Input {
  dailyBurn: number;
  daysToReset: number;
  quotaLitresLeft: number;
  quotaCap: number;
  prices: Prices;
}

export interface SpendForecast {
  litresToReset: number;
  spendToReset: number;
  nextMonthSpend: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Cost of `litres` given `subsidisedLitres` remain at the subsidised price. */
function cost(litres: number, subsidisedLitres: number, p: Prices): number {
  const sub = Math.min(litres, subsidisedLitres) * p.subsidised;
  const market = Math.max(0, litres - subsidisedLitres) * p.ron95Market;
  return sub + market;
}

export function forecastSpend(i: Input): SpendForecast {
  const litresToReset = i.dailyBurn * i.daysToReset;
  const litresNextMonth = i.dailyBurn * 30;
  return {
    litresToReset: round(litresToReset),
    // Remaining quota covers the subsidised portion until the reset.
    spendToReset: round(cost(litresToReset, i.quotaLitresLeft, i.prices)),
    // After the reset a fresh full cap lands.
    nextMonthSpend: round(cost(litresNextMonth, i.quotaCap, i.prices)),
  };
}
