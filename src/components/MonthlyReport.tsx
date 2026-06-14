// Monthly report (module 9) — a glanceable month summary. Pure props.
import type { HeroModel } from "@/lib/hero-model";
import { monthlyStats } from "@/domain/dashboard";
import { forecastSpend } from "@/domain/spend-forecast";

export function MonthlyReport({ model }: { model: HeroModel }) {
  const s = model.scenario;
  const eff = model.efficiency?.l100 ?? model.baselineL100;
  const stats = monthlyStats({
    dailyBurn: s.dailyBurn, effL100: model.efficiency?.l100 ?? null,
    baselineL100: model.baselineL100, prices: s.prices, co2PerLitreKg: model.co2PerLitreKg,
  });
  const km = Math.round((stats.monthlyLitres / eff) * 100);
  const spend = forecastSpend({
    dailyBurn: s.dailyBurn, daysToReset: s.daysToSubsidyReset,
    quotaLitresLeft: s.quotaLitresLeft, quotaCap: s.quotaCap, prices: s.prices,
  }).nextMonthSpend;
  const score = model.efficiency
    ? Math.max(0, Math.min(100, Math.round(100 - Math.max(0, model.efficiency.deviationPct))))
    : null;

  const rows: [string, string][] = [
    ["Fuel used", `${stats.monthlyLitres.toFixed(0)} L`],
    ["Distance", `${km.toLocaleString()} km`],
    ["Spend", `RM${spend.toFixed(0)}`],
    ["Cost / km", `RM${stats.costPerKm.toFixed(2)}`],
    ["CO₂", `${stats.monthlyCo2Kg.toFixed(0)} kg · ≈ ${stats.treesPerYear} trees/yr`],
    ["Eco score", score != null ? `${score}/100` : "—"],
  ];
  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Monthly report">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-[var(--ink-dim)]">Monthly report</h2>
        <span className="label text-[10px] text-[var(--ink-dim)]">projected</span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-baseline justify-between text-sm">
            <span className="text-[var(--ink-dim)]">{k}</span>
            <span className="seg font-semibold text-[var(--ink)]">{v}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
