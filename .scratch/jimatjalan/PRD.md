# PRD — JimatJalan

Status: ready-for-agent

> AI-powered Smart Fuel Management for Malaysian drivers, built around the BUDI95
> subsidy quota. Hackathon build: solo developer, ~36 hours, responsive web/PWA.
> Optimised in priority order for **Technical (50%) → Business (30%) → Pitch (20%)**.
>
> Domain language is defined in `/CONTEXT.md` and used verbatim throughout
> (capitalised terms: Subsidy Wallet, Quota Balance, Anchor, Fill, Daily Burn,
> Projected Need, Verdict, Regime, Tank Level, Efficiency Read, Baseline,
> Quota Cap, Ask JimatJalan, Demo Account).

---

## Problem Statement

A Malaysian driver wants to stop silently overpaying for fuel. Since the BUDI95
targeted subsidy, RON95 is only cheap (RM1.99/L) **up to a monthly Quota Cap**
that resets on the 1st with no rollover; past the cap they pay roughly double
(~RM4.07/L market float). They don't know their remaining quota, refuel on
empty-tank instinct rather than on quota economics, can't see what their driving
habits cost them in ringgit or CO₂, and have no single place that ties price
awareness, consumption, behaviour, and sustainability together. The result:
higher transport cost, wasted fuel, and zero feedback loop.

## Solution

One polished hero screen that turns the driver's own subsidy into a live,
spendable balance and tells them exactly what to do with it:

- **Subsidy Wallet** — remaining Quota Balance shown as *ringgit of subsidy* with
  a reset countdown ("≈ RM25 subsidy left · resets in 6 days"), depleting bar
  green→amber→red. The memory hook: *the government already gave you this money
  and it expires on the 1st.*
- **The Verdict** — one tap ("Patut Isi?") returns a confident, often
  counter-intuitive call with a hard ringgit figure ("Don't fill today — bridge
  12 L now, fill fully after reset. **Save RM58**"). Deterministic logic decides;
  the LLM gives it a human, opinionated voice.
- **Efficiency Read** — from one Fill (litres ÷ odometer gap) compute real
  L/100km, compare to Baseline, and surface wasted ringgit **and** CO₂ with a
  likely cause.
- **Ask JimatJalan** — a free-form question box where the LLM reasons over the
  driver's real computed state — the differentiator a calculator cannot copy.

The moat: this encodes a 2026 Malaysia-specific BUDI95 ruleset that changed twice
this year. No generic fuel app can replicate it.

---

## Goals

1. **Functionality & goal alignment (Technical 20%)** — a complete, working
   user workflow (onboard → log a Fill → see Wallet → tap Verdict → read
   Efficiency) that visibly solves all five case-study problems.
2. **Effective + Creative AI (Technical 20%)** — the LLM does work a calculator
   cannot: it voices an opinionated financial-advisor verdict and answers
   free-form questions grounded in the driver's real state. Numbers are always
   computed and validated in code.
3. **UI/UX (Technical 10%)** — a distinctive, polished, accessible hero screen;
   not a default-template look.
4. **Business (30%)** — a clear target market (incl. the high-pain e-hailing/gig
   segment via Quota Cap), a defensible moat, and an articulable freemium/B2B
   revenue path and roadmap.
5. **Demo that cannot fail (Pitch enabler)** — deterministic core + a single
   pre-seeded Demo Account; exactly one live network call (Claude), itself
   guardable.

## Non-Goals

- **Live price scraping or live BUDI95/station integration.** Prices and the
  Quota Anchor are seed/config and user-entered. Presented as "live-ready."
- **Measuring driving behaviour via sensors.** Behaviour is *inferred* from
  litres ÷ distance and surfaced as "likely causes," never "we measured your
  acceleration."
- **Carbon claims on the Verdict.** Timing a Fill saves money but burns the same
  fuel — CO₂ appears **only** on the Efficiency Read, where driving less/cleaner
  genuinely saves both.
- **Price forecasting / ML.** The Float Regime surfaces the *known* next
  adjustment date; it does not predict the number.
- **Multi-user auth, accounts, login wall.** Single seeded Demo Account.
- **Family quota pooling, GPS trip mode, receipt/odometer vision scan.** All
  later stretch; never a dependency.
- **Real hosted database for the MVP.** Local-first, behind a swappable adapter.

---

## Personas

1. **Aisyah — Daily Commuter (primary).** Drives a Myvi ~40 km/day KL commute on
   RON95, Quota Cap 200 L. Cost-conscious, not a car person. Wants to be *told*
   the smart move without learning fuel economics. The Wallet's "money that
   expires" reframe is built for her.
2. **Rahman — E-hailing Driver (high-pain segment).** Drives all day, Quota Cap
   800 L, burns through subsidy fast. Every ringgit per litre compounds. The
   Verdict's bridge-vs-fill timing and the Efficiency Read's cost/km matter most
   to him. Unlocks a vivid, segment-specific demo beat and a stronger market
   story.
3. **Mei Ling — Multi-vehicle Household (secondary / roadmap).** Two cars,
   tracks family fuel spend. Validates the data model's multi-vehicle shape and
   points at the family-pooling stretch.
4. **The Judge (evaluative persona).** Will ask: "How do you know my quota?"
   "What about after the quota's gone?" "Isn't the AI just formatting?" "How do
   you know it's hard acceleration?" Every design guardrail exists to survive
   these on stage.

---

## User Stories

1. As a new driver, I want to pick my driver type (Private / E-hailing / Gig) at
   onboarding, so that my Quota Cap (200 L / 800 L) is correct from the start.
2. As a new driver, I want to enter my vehicle make/model, so that my Baseline
   and tank capacity are seeded without manual tuning.
3. As a new driver, I want to optionally Anchor my current remaining quota at
   onboarding, so that my Quota Balance starts from ground truth.
4. As a new driver, I want to give a rough km/day, so that Daily Burn and
   Projected Need work from minute one before I have any Fill history.
5. As a driver, I want to see my remaining subsidy as ringgit with a reset
   countdown, so that I feel the value expiring and act before I lose it.
6. As a driver, I want the Wallet bar to shift green→amber→red, so that I grasp
   my position at a glance.
7. As a driver, I want to log a Fill (litres, ringgit, grade, odometer), so that
   my Quota Balance and Efficiency Read update.
8. As a driver, I want a RON95 Fill to decrement my Quota Balance, so that the
   Wallet reflects what I've actually used.
9. As a driver, I want to re-Anchor my balance any time via "Correct balance" on
   the Wallet, so that a missed Fill doesn't silently poison every Verdict until
   reset.
10. As a driver, I want to tap "Patut Isi?" and get one confident call with a
    ringgit figure, so that I don't have to reason about fuel economics myself.
11. As a driver with quota left, I want the Verdict to compare my Quota Balance
    against my Projected Need, so that it tells me whether to ride the subsidy or
    bridge-fill now.
12. As a driver, I want the Verdict to sometimes tell me **not** to fill, so that
    I trust it's reasoning, not upselling.
13. As a driver, I want the Verdict to nudge an adjustable Tank Level guess, so
    that the call reflects how empty I actually am right now.
14. As a driver whose quota is exhausted, I want the Verdict to switch to the
    Float Regime and time my fill against the weekly Wednesday adjustment, so
    that it stays useful even with no subsidy left.
15. As an e-hailing driver, I want the same engine to respect my 800 L cap, so
    that the advice fits my real consumption.
16. As a driver, I want my Verdict's ringgit figure validated in code before I
    see it, so that the number is never an LLM hallucination.
17. As a driver, I want the Efficiency Read after a Fill to show real L/100km vs
    Baseline with the % deviation, so that I see whether this tank was wasteful.
18. As a driver, I want wasted ringgit **and** CO₂ shown together on the
    Efficiency Read, so that cost and sustainability land in one honest place.
19. As a driver, I want a likely cause from a bounded, checkable list (tyre
    pressure, hard acceleration, idling, AC load, short trips, cargo), so that I
    have something actionable without being lied to about measurement.
20. As a driver, I want my Baseline to start from my car's real-world norm and
    personalise toward my own rolling average, so that I'm not falsely flagged
    "+20% inefficient" like every lab figure would.
21. As a driver, I want to ask JimatJalan a free-form question ("drive to JB or
    take the bus?", "why not fill today?"), so that I get advice grounded in my
    actual quota, burn, and baseline.
22. As a driver, I want Ask JimatJalan's numbers validated against my computed
    state, so that the conversational answer can't invent figures.
23. As a returning user, I want the Demo Account to open straight onto a
    populated hero screen, so that there's no empty-state cold start.
24. As a driver on any screen, I want fast, legible, accessible UI (readable
    contrast, large tap targets, BM/EN-friendly copy), so that it's usable
    one-handed at a petrol station.
25. As a judge, I want every claim the app makes to survive a "how do you know?"
    question, so that the product reads as honest, not hand-wavy.
26. As the business, I want a Quota Cap held as config keyed to driver type, so
    that new subsidy rules or new segments are a data change, not a code change.
27. As a subsidy-constrained driver (monthly burn > my Quota Cap, e.g.
    e-hailing), I want the Verdict to tell me to **bank** expiring subsidy by
    topping up before reset *even when my tank isn't low*, so that I don't
    forfeit subsidy I'd otherwise have to re-buy at market.
28. As a driver, I want the Verdict to **never claim a ringgit saving in the
    Float Regime** (where it doesn't forecast price), so that every savings
    number the app shows me is trustworthy.

---

## Implementation Decisions

**Architecture spine.** Deterministic core computes all substance; the LLM only
voices it (the "Code owns substance, LLM owns voice" principle in `CONTEXT.md`).
The LLM never originates a number or a cause; all displayed numbers are computed
and re-validated in code before render.

**Modules** (confirmed with developer):

- **`quota-ledger`** (deep, tested) — `(Anchor, Fills, Quota Cap, date) →
  { litresLeft, subsidyRinggit, daysToReset }`. The estimate, not a measurement;
  re-Anchorable. The spine every other read depends on.
- **`verdict-engine`** (deep, tested) — the crown jewel. **Single engine, two
  clocks** (see ADR-0001): one ruleset run against either the 1st-of-month clock
  (Subsidy Regime) or the weekly Wednesday clock (Float Regime). Input: quota
  balance, Daily Burn, Tank Level, Quota Cap, seed prices, grade, date. Output:
  deterministic `{ regime, action, recommendLitresNow, ringgitNow, ringgitSaved,
  reasonCode }`. No LLM. **Validated against a runnable prototype** — see
  `prototypes/verdict-engine/`.

  The Subsidy Regime collapses to **one rule** (the prototype's key finding):
  *fill only what you need to reach the reset; never buy market litres now that
  you could buy subsidised after the reset.* The dramatic "don't fill today"
  verdict simply emerges when the litres needed are small. Actions:
  - `wait` — tank is fine; don't fill.
  - `bridge` — fill only enough subsidised fuel to reach the reset; defer the
    rest. (This is the RM58 hero case: quota 12 L, burn 2, reset in 6, empty
    tank → bridge 12 L now RM23.88, save **RM58.24** — verified in the prototype.)
  - `bank` — **use-it-or-lose-it.** When the driver is *subsidy-constrained*
    (monthly burn > Quota Cap, e.g. e-hailing) and surplus subsidy will expire
    before reset, top up **even though the tank isn't low** to capture subsidy
    they'd otherwise re-buy at market. A second counter-intuitive wow verdict,
    meaningful only for the constrained segment.
  - `fill` — quota can't bridge to reset; buy what's needed now.

  In the **Float Regime** the same "bridge to the next known reprice" logic runs
  against the Wednesday clock, but `ringgitSaved` is **`null`** — we surface the
  known reset date, we **do not forecast** the price, so no saving is ever
  claimed. The Float verdict is informational, not a guaranteed saving.
- **`consumption-model`** (deep) — Daily Burn (onboarding self-report seed →
  refine toward observed Fill cadence) and the running Tank Level estimate
  (Fills + burn), surfaced as an adjustable guess. Time-box fallback: if the
  running Tank model is too costly, drop to a tap-time "Empty / ¼ / ½" prompt
  (same UI).
- **`efficiency-analyzer`** (deep) — fill-pair → real L/100km, deviation vs
  Baseline, wasted ringgit + CO₂, and a **bounded** set of likely-cause
  candidates (code owns the menu; LLM only voices the chosen one).
- **`baseline-model`** (deep) — hardcoded make/model real-world-corrected spec
  table for a handful of common Malaysian models (Myvi, Axia, Bezza, Saga, City,
  Vios), blended toward the user's rolling personal average as Fills accumulate.
- **`resets`** (deep, tested) — the two-clock date math: next 1st-of-month and
  next Wednesday adjustment. Tiny surface; both Regimes depend on it.
- **`llm-voice`** (boundary) — server-side only (Claude key never in the
  browser). Takes a *validated* decision/efficiency object, returns voiced JSON,
  re-validates numbers against the computed substance before display. Also hosts
  **Ask JimatJalan** (computed state + question → grounded answer). Model:
  `claude-opus-4-8` for verdict/advisor quality; may split cheaper/faster voice
  (`claude-haiku-4-5`) per surface later.
- **`persistence`** (boundary) — **local-first** (SQLite/Prisma or seeded JSON)
  behind a thin interface, so "swap to Postgres/Supabase" is a true one-sentence
  answer to the scalability question without paying a live-dependency tax on
  stage.
- **UI** — Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Screens:
  onboarding, Subsidy Wallet (hero), Verdict tap, Efficiency Read, fill-log form,
  Ask box. Distinctive/polished, not default-template.

**Data model (shape, not schema):** `vehicle` (make/model, tank capacity,
baseline spec, Quota Cap via driver type), `fill` (litres, ringgit, grade,
odometer, timestamp), `anchor` (quota litres, timestamp), `quota-config`
(cap, prices, reset rules as seed/config). Multi-vehicle-ready; single Demo
Account for the MVP.

**Seed/config, not constants:** prices (RON95 subsidised RM1.99, market float
~RM4.07, RON97 ~RM4.85, diesel ~RM4.97), Quota Caps (200 / 800 L), reset rules.
All swappable config — they changed twice in 2026.

**Demo Account ships pre-seeded** with Fill history, Daily Burn, and a believable
Tank Level so the hero screen and Efficiency Read work from the first second.

**Honesty guardrails (must survive a judge):** money-first, carbon-as-bonus;
CO₂ only on the Efficiency Read; behaviour inferred not measured; Quota Balance
is an estimate with a one-tap re-Anchor; Float Regime surfaces a known date, not
a forecast.

## Testing Decisions

A good test here asserts **external behaviour through a module's public
interface**, not its internals — feed inputs, assert the returned decision/number,
never reach into private helpers. The deterministic core is pure functions over
plain data, which makes this cheap and high-value.

Tested modules (confirmed with developer):

- **`verdict-engine`** — the priority. Table-driven cases across every action
  and both Regimes: `wait` (tank fine); `bridge` (quota covers survival to reset
  → assert the RM58 hero case exactly); `fill` (quota can't bridge, market litres
  unavoidable); `bank` (subsidy-constrained + surplus expiring → top up though
  tank isn't low); and Float Regime (over-quota/ineligible/RON97/diesel) where
  the assertion is **`ringgitSaved === null`** (no forecast → no claim). Assert
  `action`, `recommendLitresNow`, `ringgitNow`, `ringgitSaved`, `regime`. The
  prototype's preset table is the seed for these cases. This is what cannot break
  on stage.
- **`quota-ledger`** — Anchor + Fills + Quota Cap + date → balance,
  subsidyRinggit, daysToReset. Cases: fresh (no Anchor) → starts from cap;
  Anchored mid-month; re-Anchor overrides drift; only RON95 Fills decrement;
  crossing a reset boundary.
- **`resets`** — pure date math: next 1st-of-month and next Wednesday from
  arbitrary dates, incl. month/year boundaries and same-day edge cases.

Lighter coverage if time allows: a smoke test on `llm-voice`'s number-validation
guard (assert it rejects/repairs an LLM payload whose numbers disagree with the
computed substance) — cheap insurance for the "AI can't lie" claim.

Not automated-tested (manual/demo verification): `efficiency-analyzer` +
`baseline-model` (verify the +21% read and corrected baseline by eye on the Demo
Account), `persistence`, and UI.

## Out of Scope

See Non-Goals. Concretely deferred to stretch, never a dependency: receipt/
odometer **vision scan** auto-fill, **weekly float direction prediction**,
**family quota pooling**, **GPS trip mode** harsh-braking flags, real hosted DB,
multi-user auth, live price/BUDI95 integration, and any CO₂ claim on the Verdict.

## Further Notes

- **Build order (hero-first):** Subsidy Wallet → Verdict → Efficiency Read must
  be flawless before **Ask JimatJalan** is touched, and Ask JimatJalan must never
  compromise hero polish. A flawless hero with no Ask box beats a shaky hero with
  one.
- **ADRs to write after the prototype:** (1) single verdict engine, two clocks
  (vs ML prediction / separate regimes); (2) code-owns-substance / LLM-owns-voice
  (vs LLM-driven decisions). Captured here so nothing is lost if formal ADRs lag.
- **Pitch hooks already engineered into the system:** the "money that expires on
  the 1st" reframe, the counter-intuitive "don't fill today" Verdict, and the
  "ask it anything about your fuel" advisor moment.
- **Name:** JimatJalan (leads with *jimat* = save; broad enough to outgrow fuel).
