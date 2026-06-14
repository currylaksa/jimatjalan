# Onboarding flow

Status: ready-for-agent

## What to build

The complete first-run workflow (Technical "complete user workflow" criterion):
the user picks **driver type** (Private / E-hailing / Gig → sets Quota Cap
200/800 L), enters **vehicle make/model** (→ Baseline spec + tank capacity),
**optionally Anchors** their current remaining quota, and gives a rough **km/day**
(→ seeds Daily Burn so the Verdict works from minute one). On completion they land
on the populated hero screen.

Quota Cap is a **config value keyed to driver type, not branching logic** — the
engine reasons over "whatever the cap is."

## Acceptance criteria

- [ ] Driver-type choice sets the Quota Cap as config (200 vs 800 L)
- [ ] Make/model selection sets Baseline spec and tank capacity from the lookup table
- [ ] Anchor step is optional; if skipped, balance starts from the full Quota Cap
- [ ] km/day seeds Daily Burn so a Verdict is computable immediately after onboarding
- [ ] Completing onboarding lands on a populated Wallet/hero

## Blocked by

- `01-subsidy-wallet-seeded`

## Comments

Built (AFK).

- `src/domain/vehicle-specs.ts` — `quotaCapForDriver` (private 200 / ehailing 800
  / gig 800, a config map, **not** branching logic) + a real-world-corrected
  make/model table (Myvi, Axia, Bezza, Saga, City, Vios → baseline L/100km + tank
  capacity) with `specForModel`.
- Refactor (DRY, in service of this issue): hero composition extracted to
  `src/lib/hero-model.ts` `buildHeroModel(...)` (pure) + `src/components/Hero.tsx`.
  The seeded `/` page now renders through them, and so does the onboarding result
  — so a finished onboarding shows the **user's own** computed hero, not the seed.
- `src/components/OnboardingFlow.tsx` (`/onboarding`): 4 steps — driver type →
  Quota Cap, make/model → baseline+tank, optional Anchor (skip → full cap),
  km/day → Daily Burn (`selfReportKmPerDay` → `estimateDailyBurn`). Large
  tap targets. "See my wallet" lands on the populated Wallet + Verdict (no
  Efficiency Read until they log ≥2 fills — honest: a fresh account has no
  fill-to-fill interval yet). Home links to it; onboarding links back.

Verified: `npm test` 41 passing, `npm run build` clean (route `/onboarding`
registered), both pages render (home hero + link; onboarding step 1 with the
200/800 L caps shown).
