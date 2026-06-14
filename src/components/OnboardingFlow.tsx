"use client";

// First-run workflow (issue 08): driver type → Quota Cap, make/model → Baseline
// spec + tank, optional Anchor, km/day → Daily Burn. Lands on the populated hero
// computed from the entered data — no seeded values leak in.
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

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [driverType, setDriverType] = useState<DriverType | null>(null);
  const [makeModel, setMakeModel] = useState<string>("");
  const [anchorLitres, setAnchorLitres] = useState<string>("");
  const [kmPerDay, setKmPerDay] = useState<string>("");
  const [done, setDone] = useState(false);

  if (done && driverType) {
    const spec = specForModel(makeModel);
    const vehicle: Vehicle = {
      id: "onboarded",
      makeModel,
      tankCapacityLitres: spec.tankCapacityLitres,
      baselineSpecL100: spec.baselineSpecL100,
      driverType,
    };
    const quotaConfig: QuotaConfig = {
      quotaCap: quotaCapForDriver(driverType),
      prices: seedQuotaConfig.prices, // national market data, not per-account
      co2PerLitreKg: seedQuotaConfig.co2PerLitreKg,
    };
    const profile: Profile = {
      selfReportKmPerDay: Number(kmPerDay) || 0,
      tankLevelLitres: Math.round(spec.tankCapacityLitres / 2), // neutral default; adjust on the Verdict
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
            {makeModel} · {anchor ? `${anchor.quotaLitres} L anchored` : "full quota"}
          </p>
        </header>
        <Hero model={model} />
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setStep(0);
          }}
          className="enter text-xs text-[var(--ink-dim)] underline underline-offset-2"
        >
          Start over
        </button>
      </div>
    );
  }

  const next = () => setStep((s) => s + 1);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <header className="enter text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em]">Set up</h1>
        <p className="label mt-1 text-[11px] text-[var(--ink-dim)]">Step {step + 1} of 4</p>
      </header>

      {step === 0 && (
        <section className="pump-panel enter w-full max-w-md p-5" aria-label="Driver type">
          <h2 className="label text-xs text-[var(--ink-dim)]">How do you drive?</h2>
          <div className="mt-4 flex flex-col gap-3">
            {DRIVERS.map((d) => (
              <button
                key={d.type}
                type="button"
                onClick={() => {
                  setDriverType(d.type);
                  next();
                }}
                className="rounded-xl p-4 text-left transition-transform active:scale-[0.98]"
                style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 64 }}
              >
                <div className="text-base font-semibold text-[var(--ink)]">{d.label}</div>
                <div className="text-xs text-[var(--ink-dim)]">{d.sub}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="pump-panel enter w-full max-w-md p-5" aria-label="Make and model">
          <h2 className="label text-xs text-[var(--ink-dim)]">What do you drive?</h2>
          <div className="mt-4 flex flex-col gap-2">
            {VEHICLE_MODELS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMakeModel(m);
                  next();
                }}
                className="rounded-xl p-4 text-left text-base font-semibold text-[var(--ink)] transition-transform active:scale-[0.98]"
                style={{
                  background: makeModel === m ? "rgba(54,224,139,0.12)" : "var(--panel-inset)",
                  border: "1px solid var(--edge)",
                  minHeight: 56,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="pump-panel enter w-full max-w-md p-5" aria-label="Anchor balance">
          <h2 className="label text-xs text-[var(--ink-dim)]">Subsidised RON95 left this month?</h2>
          <p className="mt-1 text-xs text-[var(--ink-dim)]">
            From the BUDI95 app or a receipt — optional. Skip and we start from your full quota.
          </p>
          <input
            type="number"
            inputMode="decimal"
            value={anchorLitres}
            onChange={(e) => setAnchorLitres(e.target.value)}
            placeholder="e.g. 120"
            className="seg mt-4 w-full rounded-xl px-4 py-4 text-lg text-[var(--ink)] outline-none"
            style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 56 }}
          />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setAnchorLitres("");
                next();
              }}
              className="flex-1 rounded-xl py-4 text-sm font-semibold text-[var(--ink-dim)]"
              style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 56 }}
            >
              Skip
            </button>
            <button type="button" onClick={next} className="pump-btn flex-1 py-4 text-sm font-bold" style={{ minHeight: 56 }}>
              Next
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="pump-panel enter w-full max-w-md p-5" aria-label="Daily distance">
          <h2 className="label text-xs text-[var(--ink-dim)]">How far do you drive a day?</h2>
          <p className="mt-1 text-xs text-[var(--ink-dim)]">
            Kilometres per day — sets your daily burn so the verdict works from minute one.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={kmPerDay}
              onChange={(e) => setKmPerDay(e.target.value)}
              placeholder="e.g. 40"
              className="seg w-full rounded-xl px-4 py-4 text-lg text-[var(--ink)] outline-none"
              style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)", minHeight: 56 }}
            />
            <span className="label text-xs text-[var(--ink-dim)]">km/day</span>
          </div>
          <button
            type="button"
            disabled={!makeModel || !driverType || !(Number(kmPerDay) > 0)}
            onClick={() => setDone(true)}
            className="pump-btn mt-4 w-full py-4 text-base font-extrabold disabled:opacity-40"
            style={{ minHeight: 64 }}
          >
            See my wallet
          </button>
        </section>
      )}

      <Link href="/" className="enter text-xs text-[var(--ink-dim)] underline underline-offset-2">
        Back to demo
      </Link>
    </div>
  );
}
