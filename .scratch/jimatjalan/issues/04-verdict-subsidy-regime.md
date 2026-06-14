# The Verdict — subsidy regime (deterministic engine + tap)

Status: ready-for-agent

## What to build

The crown jewel's logic. A one-tap "Patut Isi? / Should I fill?" that runs the
deterministic `verdict-engine` (no LLM) over the computed state and returns an
action + a hard ringgit figure, rendered with a **deterministic placeholder
voice** for now (LLM voice arrives in `06`). Covers the **subsidy regime** only.
`consumption-model` (Daily Burn + Tank Level) is **seeded** for the Demo Account;
fill-cadence refinement is optional, not required.

The engine and its four actions are validated by the prototype at
`.scratch/jimatjalan/prototypes/verdict-engine/`. The decision shape (lift this,
do not reinvent it):

```
decideVerdict(scenario) -> {
  regime, resetClock, daysToReset,
  action,              // wait | bridge | bank | fill
  recommendLitresNow, ringgitNow,
  ringgitSaved,        // number in subsidy regime
  reasonCode,          // bounded enum the LLM will later voice
  carbonClaimable: false
}
```

The subsidy regime reduces to **one rule** (prototype finding): *fill only what
you need to reach the reset; never buy market litres now that you could buy
subsidised after it.* "Don't fill today" emerges when the needed litres are
small. `bank` fires only when the driver is subsidy-constrained (monthly burn >
Quota Cap) and surplus subsidy will expire (use-it-or-lose-it). See ADR-0001.

## Acceptance criteria

- [ ] Tapping "Patut Isi?" returns a deterministic decision with a hard ringgit figure
- [ ] `wait` when the tank is fine; `bridge` when quota covers survival to reset (assert the RM58 hero case exactly: quota 12 L, burn 2, reset in 6, empty 40 L tank → bridge 12 L, save RM58.24)
- [ ] `fill` when quota cannot bridge to reset; `bank` when subsidy-constrained + surplus expiring
- [ ] All displayed numbers are computed in `verdict-engine`, never elsewhere
- [ ] `verdict-engine` has automated table-driven tests across all four actions (seeded from the prototype presets)
- [ ] Carbon never appears on the Verdict

## Blocked by

- `01-subsidy-wallet-seeded`

## Comments

Built (AFK). `verdict-engine.mjs` ported verbatim-in-logic to
`src/domain/verdict-engine.ts` (typed `VerdictScenario`/`VerdictDecision`,
bounded `ReasonCode`). Prototype deleted (absorb-then-delete).

- Table-driven tests in `tests/verdict-engine.test.ts` cover all four actions —
  **RM58 hero case locked exactly** (quota 12, burn 2, reset 6, empty 40 L →
  bridge 12 L, RM23.88, save RM58.24), plus `wait`, `bank`, `fill`, and the
  `MINIMISE_MARKET_BEFORE_RESET` bridge. `carbonClaimable: false` asserted.
- `src/domain/consumption-model.ts` (`estimateDailyBurn`, TDD) feeds the live
  Daily Burn; Tank Level is a seeded `Profile` default (CONTEXT time-box
  fallback) — adjustable UI lands in `05`.
- `src/components/Verdict.tsx` ("Patut Isi?" tap) renders the decision with a
  deterministic placeholder voice (`src/ai/fallback-voice.ts`, keyed to
  `reasonCode`) — LLM voice replaces it in `06`.
- Live demo state (today-driven, 17 days to reset, not the cosmetic 6) →
  bridge ~31 L, save ~RM12.48. All numbers originate in the engine.

Verified: `npm test` 22 passing (pristine), `npm run build` clean, page boots
and renders the Wallet + Verdict tap.
