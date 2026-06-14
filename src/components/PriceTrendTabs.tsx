"use client";

// RON97 price trend with 7D / 1M / 1Y timeframes + an honest trend-direction
// badge (▲/▼ from the data, NOT a forecast) and an "above/below average" read.
import { useState } from "react";
import { PriceChart } from "./PriceChart";

type Series = { w: string; p: number }[];

export function PriceTrendTabs({ d7, d1m, d1y }: { d7: Series; d1m: Series; d1y: Series }) {
  const [tf, setTf] = useState<"7D" | "1M" | "1Y">("1M");
  const series = tf === "7D" ? d7 : tf === "1Y" ? d1y : d1m;
  const last = series[series.length - 1].p;
  const prev = series[series.length - 2].p;
  const dir = +(last - prev).toFixed(2);
  const avg = series.reduce((s, d) => s + d.p, 0) / series.length;
  const above = last > avg;

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="RON97 price trend">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-[var(--ink-dim)]">RON97 price trend · RM/L</h2>
        <span className="seg text-sm font-bold" style={{ color: dir > 0 ? "var(--led-red)" : dir < 0 ? "var(--led-green)" : "var(--ink)" }}>
          {dir > 0 ? "▲" : dir < 0 ? "▼" : "—"} RM{last.toFixed(2)}
        </span>
      </div>

      <div className="mt-3 flex gap-1 rounded-full p-0.5 w-max" style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)" }}>
        {(["7D", "1M", "1Y"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTf(t)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
            style={tf === t ? { background: "var(--accent)", color: "#2a1d05" } : { color: "var(--ink-dim)" }}>
            {t}
          </button>
        ))}
      </div>

      <PriceChart series={series} />

      <p className="mt-1 text-xs text-[var(--ink-dim)]">
        {dir > 0 ? "Rising" : dir < 0 ? "Falling" : "Flat"} vs last point · you&apos;re paying{" "}
        <b style={{ color: above ? "var(--led-amber)" : "var(--led-green)" }}>{above ? "above" : "below"} average</b> this period.
        History only — no guess at next week.
      </p>
    </section>
  );
}
