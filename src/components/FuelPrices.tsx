// Current Malaysian fuel prices + week-over-week change. HISTORY/current only —
// we never forecast the next price (ADR-0001). Pure props.
import type { Prices } from "@/domain/types";

const round = (n: number) => Math.round(n * 100) / 100;

function Change({ now, prev }: { now: number; prev: number }) {
  const d = round(now - prev);
  if (d === 0) return <span className="lbl" style={{ color: "var(--ink-dim)" }}>— no change</span>;
  const up = d > 0;
  return (
    <span className="seg" style={{ color: up ? "var(--led-red)" : "var(--led-green)", fontSize: ".8rem" }}>
      {up ? "▲ +" : "▼ "}
      {Math.abs(d).toFixed(2)}
    </span>
  );
}

export function FuelPrices({
  prices,
  lastWeek,
  nextRevision,
}: {
  prices: Prices;
  lastWeek: { subsidised: number; ron95Market: number; ron97: number; diesel: number };
  nextRevision: string;
}) {
  const rows = [
    { name: "RON95", note: "subsidised · your quota", now: prices.subsidised, prev: lastWeek.subsidised, hero: true },
    { name: "RON95", note: "market (over-quota)", now: prices.ron95Market, prev: lastWeek.ron95Market },
    { name: "RON97", note: "float", now: prices.ron97, prev: lastWeek.ron97 },
    { name: "Diesel", note: "subsidised", now: prices.diesel, prev: lastWeek.diesel },
  ];
  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Current fuel prices">
      <h2 className="label text-xs text-[var(--ink-dim)]">Current fuel prices · Malaysia</h2>
      <ul className="mt-3 divide-y" style={{ borderColor: "var(--edge)" }}>
        {rows.map((r) => (
          <li key={r.name + r.note} className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold text-[var(--ink)]">
                {r.name} {r.hero && <span className="led-dot" style={{ color: "var(--led-green)", marginLeft: 4 }} />}
              </div>
              <div className="text-xs text-[var(--ink-dim)]">{r.note}</div>
            </div>
            <div className="flex items-center gap-3">
              <Change now={r.now} prev={r.prev} />
              <span className="seg text-lg font-bold" style={{ color: "var(--ink)" }}>
                RM{r.now.toFixed(2)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--ink-dim)]">
        Next price revision: <span className="font-semibold text-[var(--ink)]">{nextRevision}</span> · fill
        mid-week to lock the current rate. Subsidised RON95 stays RM1.99 — that&apos;s your quota.
      </p>
    </section>
  );
}
