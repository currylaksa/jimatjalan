"use client";

// Issue 02 — log a Fill, watch the Wallet move. Posts via a server action; the
// hero (Wallet + Verdict) re-renders with the new Quota Balance.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FuelGrade } from "@/domain/types";
import { logFill } from "@/app/actions";

const GRADES: FuelGrade[] = ["RON95", "RON97", "diesel"];
const field =
  "w-full rounded-xl px-3 py-3 text-sm text-[var(--ink)] outline-none seg";
const fieldStyle = { background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 48 } as const;

export function LogFill() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [litres, setLitres] = useState("");
  const [ringgit, setRinggit] = useState("");
  const [grade, setGrade] = useState<FuelGrade>("RON95");
  const [odo, setOdo] = useState("");

  function submit() {
    setErr(null);
    start(async () => {
      const r = await logFill({
        litres: Number(litres),
        ringgit: Number(ringgit),
        grade,
        odometerKm: Number(odo),
      });
      if (!r.ok) {
        setErr(r.error ?? "Could not log the fill.");
        return;
      }
      setLitres(""); setRinggit(""); setOdo(""); setGrade("RON95");
      setOpen(false);
      router.refresh(); // reflect the moved Wallet/Verdict
    });
  }

  if (!open) {
    return (
      <section className="enter w-full max-w-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl py-4 text-sm font-bold"
          style={{ background: "var(--panel-inset)", border: "1px dashed var(--edge)", color: "var(--ink)", minHeight: 56 }}
        >
          ＋ Log a fill
        </button>
      </section>
    );
  }

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Log a fill">
      <h2 className="label text-xs text-[var(--ink-dim)]">Log a fill</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--ink-dim)]">Litres</span>
          <input className={field} style={fieldStyle} type="number" inputMode="decimal" value={litres} onChange={(e) => setLitres(e.target.value)} placeholder="12" aria-label="Litres" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--ink-dim)]">Ringgit paid</span>
          <input className={field} style={fieldStyle} type="number" inputMode="decimal" value={ringgit} onChange={(e) => setRinggit(e.target.value)} placeholder="23.88" aria-label="Ringgit paid" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--ink-dim)]">Grade</span>
          <select className={field} style={fieldStyle} value={grade} onChange={(e) => setGrade(e.target.value as FuelGrade)} aria-label="Fuel grade">
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--ink-dim)]">Odometer km</span>
          <input className={field} style={fieldStyle} type="number" inputMode="decimal" value={odo} onChange={(e) => setOdo(e.target.value)} placeholder="45300" aria-label="Odometer km" />
        </label>
      </div>

      {err && <p className="mt-3 text-sm" style={{ color: "var(--led-red)" }}>{err}</p>}

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="flex-1 rounded-xl py-3 text-sm font-semibold text-[var(--ink-dim)]" style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 48 }}>
          Cancel
        </button>
        <button type="button" disabled={pending} onClick={submit} className="pump-btn flex-1 py-3 text-sm font-bold disabled:opacity-50" style={{ minHeight: 48 }}>
          {pending ? "Saving…" : "Save fill"}
        </button>
      </div>
    </section>
  );
}
