// The spine: the Quota Balance. An ESTIMATE, re-anchorable (CONTEXT.md).
// Pure — today and all state are passed in.

import type { Anchor, Fill, Prices, QuotaBalance } from "./types";
import { nextMonthlyReset, daysUntil } from "./resets";

interface Input {
  anchor?: Anchor;
  fills: Fill[];
  quotaCap: number;
  prices: Prices;
  today: Date;
}

/** Litres reset to the full cap on the 1st, so without an anchor only this month's fills count. */
function startOfQuotaMonth(today: Date): Date {
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
}

export function computeQuotaBalance(i: Input): QuotaBalance {
  const { anchor, fills, quotaCap, prices, today } = i;

  const start = anchor ? anchor.quotaLitres : quotaCap;
  const since = anchor ? new Date(anchor.at) : startOfQuotaMonth(today);

  const consumed = fills
    .filter((f) => f.grade === "RON95" && new Date(f.at) >= since)
    .reduce((sum, f) => sum + f.litres, 0);

  const litresLeft = Math.max(0, start - consumed);
  const subsidyRinggit = litresLeft * (prices.ron95Market - prices.subsidised);
  const daysToReset = daysUntil(today, nextMonthlyReset(today));

  return { litresLeft, subsidyRinggit, daysToReset };
}
