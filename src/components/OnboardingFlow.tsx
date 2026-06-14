"use client";

// First-run workflow (issue 08): driver type → Quota Cap, make/model (+ "Other")
// → Baseline spec + tank, car year (ages the baseline), optional Anchor, km/day →
// Daily Burn. Step-by-step Back. Lands on the hero from the entered data.
import { useState } from "react";
import Link from "next/link";
import type { DriverType, Vehicle, QuotaConfig, Profile, Anchor } from "@/domain/types";
import { quotaCapForDriver, specForModel, VEHICLE_MODELS } from "@/domain/vehicle-specs";
import { seedQuotaConfig } from "@/data/seed";
import { buildHeroModel } from "@/lib/hero-model";
import { Hero } from "./Hero";

const DRIVERS: { type: DriverType; label: string; sub: string }[] = [
  { type: "private", label: "Private", sub: "Personal use · 200 L/month" },
  { type: "ehailing", label: "E-hailing", sub: "Grab / inDrive · 800 L/month" },
  { type: "gig", label: "Gig / delivery", sub: "Lalamove / food · 800 L/month" },
];
const STEPS = 5;
const THIS_YEAR = new Date().getFullYear();
const round1 = (n: number) => Math.round(n * 10) / 10;
const card = "pump-panel enter w-full max-w-md p-5";
const cardStyle = undefined;
const field = "seg w-full rounded-xl px-4 py-4 text-lg text-[var(--ink)] outline-none";
const fieldStyle = { background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 56 } as const;

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [driverType, setDriverType] = useState<DriverType | null>(null);
  const [makeModel, setMakeModel] = useState<string>("");
  const [custom, setCustom] = useState(false);
  const [customModel, setCustomModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [anchorLitres, setAnchorLitres] = useState<string>("");
  const [kmPerDay, setKmPerDay] = useState<string>("");
  const [done, setDone] = useState(false);

  const effModel = (custom ? customModel : makeModel).trim();
  const yearN = Number(year);
  const yearOk = yearN >= 1980 && yearN <= THIS_YEAR;

  if (done && driverType) {
    const spec = specForModel(effModel); // custom → sensible fallback
    const age = Math.max(0, THIS_YEAR - yearN);
    const aged = round1(spec.baselineSpecL100 * (1 + Math.min(age, 15) * 0.008)); // older → thirstier
    const vehicle: Vehicle = {
      id: "onboarded",
      makeModel: `${effModel}${yearOk ? ` · ${year}` : ""}`,
      tankCapacityLitres: spec.tankCapacityLitres,
      baselineSpecL100: aged,
      driverType,
    };
    const quotaConfig: QuotaConfig = {
      quotaCap: quotaCapForDriver(driverType),
      prices: seedQuotaConfig.prices,
      co2PerLitreKg: seedQuotaConfig.co2PerLitreKg,
    };
    const profile: Profile = {
      selfReportKmPerDay: Number(kmPerDay) || 0,
      tankLevelLitres: Math.round(spec.tankCapacityLitres / 2),
    };
    const anchor: Anchor | undefined = anchorLitres
      ? { quotaLitres: Number(anchorLitres), at: new Date().toISOString() }
      : undefined;
    const model = buildHeroModel({ vehicle, quotaConfig, profile, anchor, fills: [], today: new Date() });

    return (
      <div className="flex w-full flex-col items-center gap-5">
        <header className="enter text-center">
          <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em]">You&apos;re set</h1>
          <p className="label mt-1 text-[11px] text-[var(--ink-dim)]">
            {vehicle.makeModel} · {anchor ? `${anchor.quotaLitres} L anchored` : "full quota"}
          </p>
        </header>
        <Hero model={model} />
        <button type="button" onClick={() => { setDone(false); setStep(0); }}
          className="enter text-xs text-[var(--ink-dim)] underline underline-offset-2">Start over</button>
      </div>
    );
  }

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <header className="enter text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em]">Set up</h1>
        <p className="label mt-1 text-[11px] text-[var(--ink-dim)]">Step {step + 1} of {STEPS}</p>
      </header>

      {/* step-by-step Back */}
      {step > 0 && (
        <button type="button" onClick={back}
          className="enter -mb-2 w-full max-w-md text-left text-sm font-semibold text-[var(--ink-dim)]">
          ← Back
        </button>
      )}

      {step === 0 && (
        <section className={card} style={cardStyle} aria-label="Driver type">
          <h2 className="label text-xs text-[var(--ink-dim)]">How do you drive?</h2>
          <div className="mt-4 flex flex-col gap-3">
            {DRIVERS.map((d) => (
              <button key={d.type} type="button" onClick={() => { setDriverType(d.type); next(); }}
                className="rounded-xl p-4 text-left transition-transform active:scale-[0.98]"
                style={{ background: driverType === d.type ? "rgba(255,176,32,.14)" : "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 64 }}>
                <div className="text-base font-semibold text-[var(--ink)]">{d.label}</div>
                <div className="text-xs text-[var(--ink-dim)]">{d.sub}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className={card} style={cardStyle} aria-label="Make and model">
          <h2 className="label text-xs text-[var(--ink-dim)]">What do you drive?</h2>
          <div className="mt-4 flex flex-col gap-2">
            {VEHICLE_MODELS.map((m) => (
              <button key={m} type="button" onClick={() => { setCustom(false); setMakeModel(m); next(); }}
                className="rounded-xl p-4 text-left text-base font-semibold text-[var(--ink)] transition-transform active:scale-[0.98]"
                style={{ background: !custom && makeModel === m ? "rgba(54,224,139,0.12)" : "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 56 }}>
                {m}
              </button>
            ))}
            <button type="button" onClick={() => { setCustom(true); setMakeModel(""); }}
              className="rounded-xl p-4 text-left text-base font-semibold transition-transform active:scale-[0.98]"
              style={{ background: custom ? "rgba(54,224,139,0.12)" : "var(--panel-inset)", border: "1px dashed var(--edge)", minHeight: 56, color: "var(--ink)" }}>
              Other — type my own
            </button>
          </div>

          {custom && (
            <div className="mt-3">
              <input value={customModel} onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. Honda Civic 1.8" className={field} style={fieldStyle} aria-label="Your car make and model" />
              <p className="mt-1 text-xs text-[var(--ink-dim)]">We&apos;ll use a typical baseline — refine it as you log fills.</p>
              <button type="button" disabled={!customModel.trim()} onClick={next}
                className="pump-btn mt-3 w-full py-3 text-sm font-bold disabled:opacity-40" style={{ minHeight: 52 }}>
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className={card} style={cardStyle} aria-label="Car year">
          <h2 className="label text-xs text-[var(--ink-dim)]">What year is it?</h2>
          <p className="mt-1 text-xs text-[var(--ink-dim)]">Older cars burn a little more — this sharpens your baseline.</p>
          <input type="number" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)}
            placeholder={`e.g. ${THIS_YEAR - 6}`} className={`${field} mt-4`} style={fieldStyle} aria-label="Car year" />
          {year && !yearOk && <p className="mt-1 text-sm" style={{ color: "var(--led-red)" }}>Enter a year between 1980 and {THIS_YEAR}.</p>}
          <button type="button" disabled={!yearOk} onClick={next}
            className="pump-btn mt-4 w-full py-4 text-sm font-bold disabled:opacity-40" style={{ minHeight: 56 }}>
            Next
          </button>
        </section>
      )}

      {step === 3 && (
        <section className={card} style={cardStyle} aria-label="Anchor balance">
          <h2 className="label text-xs text-[var(--ink-dim)]">Subsidised RON95 left this month?</h2>
          <p className="mt-1 text-xs text-[var(--ink-dim)]">From the BUDI95 app or a receipt — optional. Skip and we start from your full quota.</p>
          <input type="number" inputMode="decimal" value={anchorLitres} onChange={(e) => setAnchorLitres(e.target.value)}
            placeholder="e.g. 120" className={`${field} mt-4`} style={fieldStyle} aria-label="Remaining litres" />
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => { setAnchorLitres(""); next(); }}
              className="flex-1 rounded-xl py-4 text-sm font-semibold text-[var(--ink-dim)]"
              style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 56 }}>Skip</button>
            <button type="button" onClick={next} className="pump-btn flex-1 py-4 text-sm font-bold" style={{ minHeight: 56 }}>Next</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className={card} style={cardStyle} aria-label="Daily distance">
          <h2 className="label text-xs text-[var(--ink-dim)]">How far do you drive a day?</h2>
          <p className="mt-1 text-xs text-[var(--ink-dim)]">Kilometres per day — sets your daily burn so the verdict works from minute one.</p>
          <div className="mt-4 flex items-center gap-2">
            <input type="number" inputMode="decimal" value={kmPerDay} onChange={(e) => setKmPerDay(e.target.value)}
              placeholder="e.g. 40" className={field} style={fieldStyle} aria-label="Kilometres per day" />
            <span className="label text-xs text-[var(--ink-dim)]">km/day</span>
          </div>
          <button type="button" disabled={!effModel || !driverType || !yearOk || !(Number(kmPerDay) > 0)}
            onClick={() => setDone(true)} className="pump-btn mt-4 w-full py-4 text-base font-extrabold disabled:opacity-40" style={{ minHeight: 64 }}>
            See my wallet
          </button>
        </section>
      )}

      <Link href="/" className="enter text-xs text-[var(--ink-dim)] underline underline-offset-2">Back to demo</Link>
    </div>
  );
}
