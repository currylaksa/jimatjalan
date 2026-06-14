// Recent fills — gives the Tank view real-app depth (the log behind the read).
import type { Fill } from "@/domain/types";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-MY", { day: "2-digit", month: "short" });

export function FillHistory({ fills }: { fills: Fill[] }) {
  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Fill history">
      <h2 className="label text-xs text-[var(--ink-dim)]">Recent fills</h2>
      {fills.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--ink-dim)]">No fills logged yet.</p>
      ) : (
        <ul className="mt-3 divide-y" style={{ borderColor: "var(--edge)" }}>
          {fills.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-3">
              <div>
                <div className="seg text-base font-semibold text-[var(--ink)]">
                  {f.litres} L · {f.grade}
                </div>
                <div className="text-xs text-[var(--ink-dim)]">
                  {fmtDate(f.at)} · {f.odometerKm.toLocaleString()} km
                </div>
              </div>
              <div className="seg text-sm font-semibold text-[var(--ink)]">RM{f.ringgit.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
