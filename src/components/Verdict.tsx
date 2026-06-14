"use client";

// The Verdict — one-tap "Patut Isi?" pump trigger. Runs the deterministic
// verdict-engine and renders the action + hard ringgit figure as an LED readout.
// LLM voice (issue 06) fetched server-side; deterministic line until it lands.
import { useEffect, useState } from "react";
import { decideVerdict } from "@/domain/verdict-engine";
import type { VerdictScenario, VerdictAction } from "@/domain/verdict-engine";
import { fallbackVerdictVoice } from "@/ai/fallback-voice";

const ACTION_STYLE: Record<VerdictAction, { color: string; label: string }> = {
  wait: { color: "var(--led-green)", label: "Don't fill" },
  bridge: { color: "var(--led-amber)", label: "Bridge it" },
  bank: { color: "#38bdf8", label: "Bank it" },
  fill: { color: "var(--led-red)", label: "Fill now" },
};

export function Verdict({ scenario }: { scenario: VerdictScenario }) {
  const [open, setOpen] = useState(false);
  // Tank Level is an adjustable guess, never an asserted measurement (CONTEXT.md).
  const [tankLevel, setTankLevel] = useState(scenario.tankLevelLitres);
  const effectiveScenario = { ...scenario, tankLevelLitres: tankLevel };
  const d = decideVerdict(effectiveScenario);
  const { color, label } = ACTION_STYLE[d.action];

  const fallback = fallbackVerdictVoice(d);
  const [llmVoice, setLlmVoice] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLlmVoice(null);
    let cancelled = false;
    const t = setTimeout(() => {
      fetch("/api/voice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(effectiveScenario),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled && typeof data?.text === "string") setLlmVoice(data.text);
        })
        .catch(() => {});
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tankLevel]);

  if (!open) {
    return (
      <section className="pump-panel enter w-full max-w-md p-5" aria-label="Verdict">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pump-btn flex w-full items-center justify-center gap-3 px-6 py-5"
          style={{ minHeight: 68 }}
        >
          <span className="label text-xl font-extrabold">Patut Isi?</span>
          <span className="text-sm font-semibold opacity-70">▸ Should I fill?</span>
        </button>
      </section>
    );
  }

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Verdict">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-[var(--ink-dim)]">Verdict</h2>
        <span className="flex items-center gap-2 text-[11px]" style={{ color }}>
          <span className="led-dot" />
          <span className="label">
            {d.regime} · {d.daysToReset}d
          </span>
        </span>
      </div>

      <div className="readout mt-3 px-5 py-4">
        <div className="label text-3xl font-extrabold" style={{ color }}>
          {label}
        </div>

        {d.recommendLitresNow > 0 && (
          <div className="seg mt-3 flex items-baseline gap-2 text-3xl font-bold">
            <span style={{ color: "var(--ink)" }}>{d.recommendLitresNow} L</span>
            <span className="text-sm text-[var(--ink-dim)]">
              {d.pricePerLitreNow == null
                ? `· ${d.subsidisedNow} L sub + ${d.marketNow} L mkt`
                : `· RM${d.ringgitNow.toFixed(2)}`}
            </span>
          </div>
        )}

        {d.pricePerLitreNow == null && (
          <div className="seg mt-1 text-sm text-[var(--ink-dim)]">
            Pay now ≈ <span style={{ color: "var(--ink)" }}>RM{d.ringgitNow.toFixed(2)}</span>
          </div>
        )}

        {d.ringgitSaved != null && d.ringgitSaved > 0 && (
          <div
            className="seg mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold"
            style={{ background: "rgba(54,224,139,0.12)", color: "var(--led-green)" }}
          >
            {d.reasonCode === "BANK_EXPIRING_SUBSIDY"
              ? `RM${d.ringgitSaved.toFixed(2)} before it expires`
              : `Save RM${d.ringgitSaved.toFixed(2)} vs a full tank`}
          </div>
        )}
      </div>

      <p className="mt-4 text-base leading-relaxed text-[var(--ink)]">{llmVoice ?? fallback}</p>

      <div className="mt-5 border-t border-[var(--edge)] pt-4">
        <div className="flex items-baseline justify-between text-sm">
          <label htmlFor="tank-level" className="text-[var(--ink-dim)]">
            Tank now <span className="opacity-70">(your guess)</span>
          </label>
          <span className="seg font-semibold" style={{ color: "var(--ink)" }}>
            ≈ {tankLevel} / {scenario.tankCapacityLitres} L
          </span>
        </div>
        <input
          id="tank-level"
          type="range"
          min={0}
          max={scenario.tankCapacityLitres}
          step={1}
          value={tankLevel}
          onChange={(e) => setTankLevel(Number(e.target.value))}
          className="mt-2 h-6 w-full cursor-pointer accent-[var(--accent)]"
          aria-label="Adjust your current tank level"
        />
        <div className="label flex justify-between text-[10px] text-[var(--ink-dim)]">
          <span>Empty</span>
          <span>Full</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-4 text-xs text-[var(--ink-dim)] underline underline-offset-2"
      >
        Ask again
      </button>
    </section>
  );
}
