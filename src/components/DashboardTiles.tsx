// Unified dashboard tiles (module 5): one glance at spend, cost/km, CO₂ + trees,
// and the Eco score. Pure props from the hero model.
import Link from "next/link";
import type { HeroModel } from "@/lib/hero-model";
import { monthlyStats } from "@/domain/dashboard";
import { forecastSpend } from "@/domain/spend-forecast";

export function DashboardTiles({ model }: { model: HeroModel }) {
  const s = model.scenario;
  const stats = monthlyStats({
    dailyBurn: s.dailyBurn,
    effL100: model.efficiency?.l100 ?? null,
    baselineL100: model.baselineL100,
    prices: s.prices,
    co2PerLitreKg: model.co2PerLitreKg,
  });
  const spend = forecastSpend({
    dailyBurn: s.dailyBurn, daysToReset: s.daysToSubsidyReset,
    quotaLitresLeft: s.quotaLitresLeft, quotaCap: s.quotaCap, prices: s.prices,
  }).nextMonthSpend;
  const score = model.efficiency
    ? Math.max(0, Math.min(100, Math.round(100 - Math.max(0, model.efficiency.deviationPct))))
    : null;

  const Tile = ({ lbl, val, sub, color = "var(--ink)" }: { lbl: string; val: string; sub?: string; color?: string }) => (
    <div className="readout px-4 py-3">
      <div className="lbl">{lbl}</div>
      <div className="seg text-2xl font-bold leading-none" style={{ color }}>{val}</div>
      {sub && <div className="seg mt-1 text-[10px] text-[var(--ink-dim)]">{sub}</div>}
    </div>
  );

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Dashboard">
      <h2 className="label text-xs text-[var(--ink-dim)]">This month at a glance</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Tile lbl="Spend / month" val={`RM${spend.toFixed(0)}`} sub="projected from usage" />
        <Tile lbl="Cost / km" val={`RM${stats.costPerKm.toFixed(2)}`} sub="at subsidised RON95" />
        <Tile lbl="CO₂ / month" val={`${stats.monthlyCo2Kg.toFixed(0)} kg`} sub={`≈ ${stats.treesPerYear} trees/yr to offset`} color="var(--led-amber)" />
        {score != null ? (
          <Link href="/tank" className="readout block px-4 py-3">
            <div className="lbl">Eco score</div>
            <div className="seg text-2xl font-bold leading-none" style={{ color: score >= 90 ? "var(--led-green)" : "var(--led-amber)" }}>
              {score}<span className="text-xs text-[var(--ink-dim)]">/100</span>
            </div>
            <div className="seg mt-1 text-[10px] text-[var(--ink-dim)]">tap for details →</div>
          </Link>
        ) : (
          <Tile lbl="Eco score" val="—" sub="log 2 fills" />
        )}
      </div>
    </section>
  );
}
