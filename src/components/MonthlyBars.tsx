// Monthly fuel spend — bar chart (module 5). Inline SVG.
export function MonthlyBars({ data }: { data: { m: string; rm: number }[] }) {
  const W = 340, H = 150, L = 30, R = 8, T = 12, B = 22;
  const max = Math.max(...data.map((d) => d.rm)) * 1.1;
  const bw = ((W - L - R) / data.length) * 0.6;
  const x = (i: number) => L + i * ((W - L - R) / data.length) + ((W - L - R) / data.length - bw) / 2;
  const y = (v: number) => T + (1 - v / max) * (H - T - B);

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Monthly spend">
      <h2 className="label text-xs text-[var(--ink-dim)]">Monthly fuel spend · RM</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Monthly fuel spend bar chart">
        {[0, max / 2, max].map((v, i) => (
          <g key={i}>
            <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="var(--edge)" strokeWidth="1" />
            <text x={L - 4} y={y(v) + 3} textAnchor="end" fontSize="8" fill="var(--ink-dim)" fontFamily="var(--font-mono)">{v.toFixed(0)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={d.m}>
            <rect x={x(i)} y={y(d.rm)} width={bw} height={H - B - y(d.rm)} rx="3" fill="var(--led-green)" opacity={i === data.length - 1 ? 1 : 0.55} />
            <text x={x(i) + bw / 2} y={H - 8} textAnchor="middle" fontSize="8" fill="var(--ink-dim)" fontFamily="var(--font-mono)">{d.m}</text>
          </g>
        ))}
      </svg>
    </section>
  );
}
