# Efficiency Read

Status: ready-for-agent

## What to build

The third hero pillar. From one fill-to-fill interval (litres ÷ odometer gap),
`efficiency-analyzer` computes real **L/100km**, compares to `baseline-model`, and
surfaces wasted **ringgit and CO₂ together** plus a **likely cause**. Money leads,
CO₂ rides underneath — and CO₂ appears **only here**, never on the Verdict.

`baseline-model` is hybrid: seeded from a hardcoded make/model real-world-corrected
spec table (Myvi, Axia, Bezza, Saga, City, Vios) so honest drivers aren't falsely
flagged "+20%", then migrates toward the user's own rolling average as Fills
accumulate. The likely cause is chosen by **code from a bounded menu** (tyre
pressure, hard acceleration, idling, AC load, short trips, cargo) — never an LLM
free-styling a cause. Requires ≥2 seeded Fills with odometer readings.

## Acceptance criteria

- [ ] Computes real L/100km from a fill pair and shows deviation % vs Baseline
- [ ] Shows wasted ringgit and CO₂ together, money-first
- [ ] Baseline uses the real-world-corrected spec table, blending to personal average as Fills grow
- [ ] Likely cause is selected by code from the bounded menu; never an unfounded specific claim
- [ ] No carbon claim leaks onto the Verdict

## Blocked by

- `01-subsidy-wallet-seeded`

## Comments

Built (AFK), both domain modules TDD'd.

- `src/domain/efficiency-analyzer.ts` `analyzeEfficiency(fillPair, baseline,
  prices, co2PerLitreKg)` → real L/100km (later fill's litres ÷ odometer gap),
  deviation %, wasted ringgit **priced at what the driver actually paid**
  (`ringgit/litres`), wasted CO₂, and `causeCandidates` drawn only from the fixed
  menu (tyre pressure / hard acceleration / idling / AC load / short trips /
  cargo) — empty within a 5% tolerance so honest drivers aren't flagged.
- `src/domain/baseline-model.ts` `resolveBaseline(spec, personalFills)` — spec
  until ≥2 personal intervals, then blends toward the rolling personal average
  (confidence grows to full over 6 intervals). 8 tests across both modules.
- Seed: added `co2PerLitreKg: 2.31` (petrol) to `QuotaConfig`; nudged fill-2's
  odometer to 45160 so the seeded pair reads a believable 7.5 L/100km (≈+17% over
  the 6.4 Myvi baseline) — fuel litres unchanged, so the Wallet is untouched.
- `src/components/EfficiencyRead.tsx` (server component): **money leads** (≈RM3.50
  wasted, large/amber), **CO₂ rides underneath** (4.1 kg, small/dim), culprit
  chips below. Verified rendered output; **CO₂ appears only here** — the Verdict
  carries no carbon (`carbonClaimable: false`, nothing rendered).

Note: the make/model real-world-corrected **spec lookup table** (Myvi, Axia,
Bezza, Saga, City, Vios) is wired at onboarding (`08`) — here the corrected spec
arrives via `vehicle.baselineSpecL100` (seeded 6.4) and feeds `resolveBaseline`.

Verified: `npm test` 41 passing (pristine), `npm run build` clean, page renders
Wallet + Verdict + Efficiency Read.
