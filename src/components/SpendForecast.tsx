// Predicted spend (brief: "predict next fuel expense"). We forecast the driver's
// own spend — never the price (ADR-0001). Pure props.
import type { VerdictScenario } from "@/domain/verdict-engine";
import { forecastSpend } from "@/domain/spend-forecast";

export function SpendForecast({ scenario }: { scenario: VerdictScenario }) {
  const f = forecastSpend({
    dailyBurn: scenario.dailyBurn,
    daysToReset: scenario.daysToSubsidyReset,
    quotaLitresLeft: scenario.quotaLitresLeft,
    quotaCap: scenario.quotaCap,
    prices: scenario.prices,
  });

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Spend forecast">
      <h2 className="label text-xs text-[var(--ink-dim)]">Predicted spend</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="readout px-4 py-3">
          <div className="seg text-3xl font-bold leading-none" style={{ color: "var(--ink)" }}>
            RM{f.spendToReset.toFixed(0)}
          </div>
          <div className="label mt-1 text-[10px] text-[var(--ink-dim)]">to next reset</div>
        </div>
        <div className="readout px-4 py-3">
          <div className="seg text-3xl font-bold leading-none" style={{ color: "var(--ink)" }}>
            RM{f.nextMonthSpend.toFixed(0)}
          </div>
          <div className="label mt-1 text-[10px] text-[var(--ink-dim)]">next full month</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--ink-dim)]">
        From your usage (~{f.litresToReset.toFixed(0)} L to reset) — a forecast of your
        spend, not a bet on the price.
      </p>
    </section>
  );
}
