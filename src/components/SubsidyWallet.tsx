// The Subsidy Wallet — remaining BUDI95 quota as a fuel-pump readout: LED ringgit
// counter in a recessed well, a status LED, and a green→amber→red depletion bar.
import type { QuotaBalance } from "@/domain/types";

function band(fraction: number) {
  if (fraction > 0.5) return { color: "var(--led-green)", label: "Healthy" };
  if (fraction > 0.2) return { color: "var(--led-amber)", label: "Running low" };
  return { color: "var(--led-red)", label: "Almost gone" };
}

export function SubsidyWallet({
  balance,
  quotaCap,
}: {
  balance: QuotaBalance;
  quotaCap: number;
}) {
  const fraction = Math.max(0, Math.min(1, balance.litresLeft / quotaCap));
  const { color, label } = band(fraction);
  const ringgit = balance.subsidyRinggit.toFixed(0);

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Subsidy Wallet">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-[var(--ink-dim)]">BUDI95 · RON95</h2>
        <span className="flex items-center gap-2 text-[11px]" style={{ color }}>
          <span className="led-dot" />
          <span className="label">{label}</span>
        </span>
      </div>

      {/* Recessed LED counter well — money first, pump-counter big. */}
      <div className="readout mt-3 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="seg text-6xl font-bold leading-none" style={{ color }}>
            RM{ringgit}
          </span>
          <span className="label text-[10px] text-[var(--ink-dim)]">subsidy left</span>
        </div>

        <div className="seg mt-3 text-sm text-[var(--ink-dim)]">
          {balance.litresLeft.toFixed(0)} L @ RM1.99 · resets in{" "}
          <span style={{ color: "var(--ink)" }}>{balance.daysToReset}</span> days
        </div>

        {/* Depletion bar. */}
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.05)" }}
          role="progressbar"
          aria-label="BUDI95 quota remaining"
          aria-valuenow={Math.round(fraction * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bar-fill h-full rounded-full"
            style={{ width: `${fraction * 100}%`, background: color, boxShadow: `0 0 12px ${color}` }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--ink-dim)]">
        Government money, already yours — expires on the 1st, no rollover.
      </p>
    </section>
  );
}
