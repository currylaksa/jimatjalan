"use client";

// Issue 03 — "Correct balance" re-anchor. Quiet, secondary affordance on the
// Wallet: set remaining quota to a known value (BUDI95 app / receipt). The
// honesty valve for estimate drift.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { correctBalance } from "@/app/actions";

export function CorrectBalance() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [litres, setLitres] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    start(async () => {
      const r = await correctBalance(Number(litres));
      if (!r.ok) {
        setErr(r.error ?? "Could not update.");
        return;
      }
      setLitres("");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="enter text-xs text-[var(--ink-dim)] underline underline-offset-2"
      >
        Correct balance
      </button>
    );
  }

  return (
    <section className="pump-panel enter w-full max-w-md p-4" aria-label="Correct balance">
      <p className="text-xs text-[var(--ink-dim)]">
        Remaining subsidised RON95 (from the BUDI95 app or receipt):
      </p>
      <div className="mt-2 flex gap-2">
        <input
          className="seg w-full rounded-xl px-3 py-3 text-sm text-[var(--ink)] outline-none"
          style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 48 }}
          type="number"
          inputMode="decimal"
          value={litres}
          onChange={(e) => setLitres(e.target.value)}
          placeholder="e.g. 95"
          aria-label="Remaining litres"
        />
        <button type="button" disabled={pending} onClick={submit} className="pump-btn px-4 text-sm font-bold disabled:opacity-50" style={{ minHeight: 48 }}>
          {pending ? "…" : "Set"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm" style={{ color: "var(--led-red)" }}>{err}</p>}
      <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="mt-2 text-xs text-[var(--ink-dim)] underline underline-offset-2">
        Cancel
      </button>
    </section>
  );
}
