"use client";

// Self-reported driving style (module 3, manual alternative to sensors). Feeds the
// likely-cause ranking + eco-tips. Honest: it's what the driver tells us.
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DrivingStyle as Style } from "@/domain/types";
import { setDrivingStyle } from "@/app/actions";

const OPTS: { v: Style; label: string }[] = [
  { v: "smooth", label: "Smooth" },
  { v: "normal", label: "Normal" },
  { v: "aggressive", label: "Aggressive" },
];

export function DrivingStyle({ current, live }: { current: Style; live: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Driving style">
      <h2 className="label text-xs text-[var(--ink-dim)]">Your driving style</h2>
      <p className="mt-1 text-xs text-[var(--ink-dim)]">Self-reported — sharpens your likely culprits below.</p>
      <div className="mt-3 flex gap-2">
        {OPTS.map((o) => {
          const on = current === o.v;
          return (
            <button
              key={o.v}
              type="button"
              disabled={!live || pending}
              onClick={() => start(async () => { await setDrivingStyle(o.v); router.refresh(); })}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-60"
              style={on
                ? { background: "var(--accent)", color: "#2a1d05", minHeight: 48 }
                : { background: "var(--panel-inset)", border: "1px solid var(--edge)", color: "var(--ink)", minHeight: 48 }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {!live && <p className="mt-2 text-xs text-[var(--ink-dim)]">Read-only on this demo persona.</p>}
    </section>
  );
}
