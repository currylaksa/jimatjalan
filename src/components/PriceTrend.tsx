// RON97 weekly price trend (RM/L) — past weeks, an honest line, no forecast.
// Inline SVG, no chart library.
export function PriceTrend({ series }: { series: { w: string; p: number }[] }) {
  const W = 340, H = 150, L = 36, R = 10, T = 12, B = 26;
  const xs = (i: number) => L + (i * (W - L - R)) / (series.length - 1);
  const ps = series.map((d) => d.p);
  const min = Math.min(...ps) - 0.05, max = Math.max(...ps) + 0.05;
  const ys = (p: number) => T + (1 - (p - min) / (max - min)) * (H - T - B);
  const line = series.map((d, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${ys(d.p).toFixed(1)}`).join(" ");
  const area = `${line} L${xs(series.length - 1).toFixed(1)} ${H - B} L${xs(0).toFixed(1)} ${H - B} Z`;
  const last = series[series.length - 1];

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="RON97 price trend">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-[var(--ink-dim)]">RON97 price trend · RM/L</h2>
        <span className="seg text-sm font-bold" style={{ color: "var(--ink)" }}>RM{last.p.toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Weekly RON97 price line chart">
        {[min, (min + max) / 2, max].map((v, i) => {
          const y = ys(v);
          return (
            <g key={i}>
              <line x1={L} y1={y} x2={W - R} y2={y} stroke="var(--edge)" strokeWidth="1" />
              <text x={L - 5} y={y + 3} textAnchor="end" fontSize="8" fill="var(--ink-dim)" fontFamily="var(--font-mono)">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        <path d={area} fill="rgba(18,161,80,0.10)" />
        <path d={line} fill="none" stroke="var(--led-green)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {series.map((d, i) => (
          <g key={d.w}>
            <circle cx={xs(i)} cy={ys(d.p)} r={i === series.length - 1 ? 3.6 : 2.2} fill="var(--led-green)" />
            <text x={xs(i)} y={H - 9} textAnchor="middle" fontSize="8" fill="var(--ink-dim)" fontFamily="var(--font-mono)">
              {d.w}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-[var(--ink-dim)]">Past 8 weeks — we show what happened, not a guess at next week.</p>
    </section>
  );
}
