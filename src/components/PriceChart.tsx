// Bare price line chart (SVG). Used by PriceTrendTabs.
export function PriceChart({ series }: { series: { w: string; p: number }[] }) {
  const W = 340, H = 150, L = 36, R = 10, T = 12, B = 26;
  const xs = (i: number) => L + (i * (W - L - R)) / (series.length - 1);
  const ps = series.map((d) => d.p);
  const min = Math.min(...ps) - 0.05, max = Math.max(...ps) + 0.05;
  const ys = (p: number) => T + (1 - (p - min) / (max - min)) * (H - T - B);
  const line = series.map((d, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${ys(d.p).toFixed(1)}`).join(" ");
  const area = `${line} L${xs(series.length - 1).toFixed(1)} ${H - B} L${xs(0).toFixed(1)} ${H - B} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="RON97 price line chart">
      {[min, (min + max) / 2, max].map((v, i) => (
        <g key={i}>
          <line x1={L} y1={ys(v)} x2={W - R} y2={ys(v)} stroke="var(--edge)" strokeWidth="1" />
          <text x={L - 5} y={ys(v) + 3} textAnchor="end" fontSize="8" fill="var(--ink-dim)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
        </g>
      ))}
      <path d={area} fill="rgba(18,161,80,0.10)" />
      <path d={line} fill="none" stroke="var(--led-green)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((d, i) => (
        <g key={d.w}>
          <circle cx={xs(i)} cy={ys(d.p)} r={i === series.length - 1 ? 3.6 : 2.2} fill="var(--led-green)" />
          <text x={xs(i)} y={H - 9} textAnchor="middle" fontSize="8" fill="var(--ink-dim)" fontFamily="var(--font-mono)">{d.w}</text>
        </g>
      ))}
    </svg>
  );
}
