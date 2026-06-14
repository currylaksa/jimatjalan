// The Efficiency Read — third pillar as a pump readout. Money leads; CO₂ rides
// underneath and appears ONLY here, never on the Verdict (ADR-0002).
import type { EfficiencyResult } from "@/domain/efficiency-analyzer";

export function EfficiencyRead({
  result,
  baselineL100,
}: {
  result: EfficiencyResult;
  baselineL100: number;
}) {
  const over = result.deviationPct > 5;
  const color = over ? "var(--led-amber)" : "var(--led-green)";
  const sign = result.deviationPct >= 0 ? "+" : "";
  // Driver Efficiency Score (brief feature #3): 100 when at/under baseline.
  const score = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, result.deviationPct))));

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Efficiency Read">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-[var(--ink-dim)]">Driver Efficiency Score</h2>
        <span className="seg text-xs font-semibold" style={{ color }}>
          {sign}
          {result.deviationPct.toFixed(0)}% vs baseline
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="seg text-4xl font-bold leading-none" style={{ color }}>{score}</span>
        <span className="label text-[10px] text-[var(--ink-dim)]">/ 100 efficiency score</span>
      </div>

      <div className="readout mt-3 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="seg text-5xl font-bold leading-none" style={{ color }}>
            {result.l100.toFixed(1)}
          </span>
          <span className="label text-[10px] text-[var(--ink-dim)]">
            L/100km · target {baselineL100.toFixed(1)}
          </span>
        </div>

        {result.wastedRinggit > 0 ? (
          <>
            {/* Money first, large. */}
            <div className="seg mt-4 text-2xl font-bold" style={{ color }}>
              ≈ RM{result.wastedRinggit.toFixed(2)} wasted
            </div>
            {/* CO₂ secondary — smaller, dimmer, rides underneath. */}
            <div className="seg mt-1 text-xs text-[var(--ink-dim)]">
              and {result.wastedCo2Kg.toFixed(1)} kg CO₂ this tank
            </div>
          </>
        ) : (
          <div className="mt-4 text-base font-semibold" style={{ color }}>
            Bang on — no fuel wasted this tank.
          </div>
        )}
      </div>

      {result.wastedRinggit > 0 && result.causeCandidates.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[var(--ink-dim)]">Likely culprits — check what fits:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.causeCandidates.map((c) => (
              <span
                key={c}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "rgba(185,115,10,0.12)", color: "var(--led-amber)" }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
