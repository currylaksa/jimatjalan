// The two clocks (ADR-0001). Pure UTC date math — no Date.now() inside.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** The 1st of the next month — the BUDI95 quota reset (no rollover). */
export function nextMonthlyReset(today: Date): Date {
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
}

/** The next Wednesday strictly after today — the weekly market reprice. */
export function nextWeeklyReset(today: Date): Date {
  const WEDNESDAY = 3;
  let delta = (WEDNESDAY - today.getUTCDay() + 7) % 7;
  if (delta === 0) delta = 7; // already Wednesday → next cycle
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + delta),
  );
}

/** Whole days from `today` to `target`. */
export function daysUntil(today: Date, target: Date): number {
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}
