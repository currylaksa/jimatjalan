# Ask JimatJalan (grounded advisor)

Status: ready-for-agent

## What to build

The primary Creative-AI differentiator — the capability a calculator cannot copy.
A free-form question box where the user asks anything about their fuel situation
("drive to JB or take the bus?", "why not fill today?", "what if my quota drops to
100 L next month?"). A server-side route passes the user's **real computed state**
(Quota Balance, Daily Burn, Baseline, Regime) plus the question to Claude, which
reasons over it and answers. Numbers in the answer are validated in code.

Build only after the hero (Wallet → Verdict → Efficiency Read) is flawless; it
must never compromise hero polish.

## Acceptance criteria

- [ ] Free-form question box answers grounded in the user's actual computed state
- [ ] Server-side only; Claude key never exposed
- [ ] Any figures in the answer are validated against computed state before display
- [ ] Gracefully handles an unanswerable/out-of-scope question without inventing numbers
- [ ] Does not regress hero-screen behaviour or polish

## Blocked by

- `06-verdict-llm-voice`

## Comments

Built (AFK) — reuses the `ai/` boundary from `06`.

- `askAdvisor(state, question)` in `src/ai/llm-voice.ts` (server-only): Claude
  **`claude-opus-4-8`** (adaptive thinking, `effort: medium`) reasons over the
  driver's computed state (regime, quota litres, subsidy ringgit, daily burn,
  baseline, days-to-reset, the current verdict). The answer is **grounded** —
  `isAnswerGrounded` (in `validate.ts`, TDD'd: accepts state-only figures and
  figure-free advice, rejects an invented RM amount) rejects any RM/litre figure
  not derivable from the state, falling back to a deterministic state recap.
- `src/app/api/ask/route.ts` (POST) recomputes the verdict from the scenario
  (substance server-authoritative) and builds the advisor state; key never
  client-side.
- `src/components/AskBox.tsx` sits **below** the hero (doesn't touch it), with a
  free-form box + two suggestion chips ("Why not fill today?", "Drive to JB or
  take the bus?").

**ANTHROPIC_API_KEY still unset**, so the route serves the grounded recap today —
verified via `curl`: "Right now: 12 L of subsidised RON95 left (~RM24.96 of
subsidy), burning about 2 L/day, 17 days to the reset." Set the key to light up
free-form reasoning; the grounding guard + fallback are already in place.

Verified: `npm test` 44 passing (pristine), `npm run build` clean (`/api/ask`
registered), AskBox renders under the hero on both `/` and the onboarded view.

## Comments (post-grill — grounded trip math)

Judge caught that the strict guard neutered the marquee "drive to JB?" question
(external numbers → rejected → recap). Fixed: `src/domain/trip-costs.ts`
(`computeTripCosts`, TDD) computes fuel cost per common trip from baseline ×
price — code owns the number. Route feeds `trips` into the advisor state; guard's
`allowed` widened to legit one-step derivations (trip cost, round-trip ×2,
shortfall = need − have); prompt forbids invented transport fares. Demo chips now
"Why not fill today?" / "Will I run out before reset?" / "Drive to JB…". Verified
live (haiku): JB → "RM85.96 in fuel, bus cheaper"; run-out → "22-litre shortfall…
bridge 31 L at RM101.21". All figures code-validated. `npm test` 51 passing.
