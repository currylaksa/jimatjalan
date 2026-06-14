# CONTEXT — JimatJalan glossary

The shared language of the domain. Glossary only — no implementation details.

## Subsidy Wallet
The hero UI element showing the user's remaining BUDI95 RON95 quota for the
current calendar month, expressed in **ringgit of subsidy** (not just litres)
with a countdown to the 1st-of-month reset. No rollover.

## Quota Balance
The estimated litres of subsidised RON95 the user has left this month. It is an
**estimate, not a measurement** — there is no live link to the BUDI95 backend or
petrol stations. It is anchored at onboarding (see Anchor) and then projected
forward by subtracting logged Fills. Because it is an estimate, the Verdict must
speak with calibrated, not absolute, confidence.

## Demo Account
The single, pre-seeded account the product is built and demoed on. No login wall,
no multi-user auth for the MVP (family quota pooling is a later stretch). Ships
with seeded Fill history, a seeded Daily Burn, and a believable Tank Level so the
hero screen and Efficiency Read work from the first second of the demo.

## Quota Cap
The monthly subsidised-litre ceiling, held as a per-account **config value** keyed
to driver type (Private 200 L · E-hailing/Gig 800 L), not branching logic. The
single-path engine reasons over "whatever the cap is"; the cap is data feeding it.
Unlocks the high-fuel-pain ride-hailing/delivery segment with near-zero extra code.

## Anchor
The act of setting the Quota Balance to a known ground-truth value (e.g. read
from the official BUDI95 app or receipt). Offered optionally at onboarding, and
also reachable any time after via an always-available "Correct balance"
affordance on the Subsidy Wallet. Re-anchoring is the honesty valve for estimate
drift: a missed Fill can be corrected in one tap rather than poisoning the
balance until the next reset. If never anchored, the balance starts from the
full monthly quota.

## Fill
A logged refuelling event: litres, ringgit paid, fuel grade, and odometer
reading. The unit of input that decrements the Quota Balance (for RON95) and
feeds the Efficiency read.

## Daily Burn
The estimated litres of fuel the user consumes per day. Seeded from an
onboarding self-report (km/day × vehicle efficiency) so it works from minute
one, then refined toward observed Fill cadence as real Fills accumulate
(hybrid). For the live demo the value is pre-seeded on the demo account.

## Projected Need
Daily Burn × days remaining until the next quota reset. The litres the user is
expected to consume before the 1st. The Verdict's central comparison is Quota
Balance vs Projected Need.

## Verdict
The one-tap "Patut Isi? / Should I fill?" call. A deterministic decision (code,
not LLM) that returns an action, litres, and a hard ringgit figure, which the
LLM then renders into a human, opinionated voice. Operates in two regimes
handled by a single engine (see Regime). One of four actions: **wait** (tank
fine), **bridge** (fill only enough to reach the next reset), **bank** (see
Bank), or **fill** (quota can't bridge; buy what's needed now). The Subsidy
Regime reduces to a single rule — *fill only what you need to reach the reset;
never buy market litres now that you could buy subsidised after it* — from which
"don't fill today" emerges when the needed litres are small.

## Bank
The "use-it-or-lose-it" Verdict: when a driver is **subsidy-constrained**
(monthly burn exceeds their Quota Cap, e.g. e-hailing) and surplus subsidy will
expire at the next reset, the smart call is to top up *even though the tank isn't
low* — capturing subsidised litres they would otherwise have to re-buy at market.
Meaningful only for the constrained segment; for a light driver, expiring quota
is not a loss because fresh quota lands on the 1st.

## Regime
The Verdict runs one "bridge-to-the-next-reset" engine against two different
clocks:
- **Subsidy regime** — Quota Balance remains. Reset clock = the 1st of the
  month. Decision = Quota Balance vs Projected Need (pure arithmetic).
- **Float regime** — quota exhausted, or fuel grade is RON97/diesel. Reset
  clock = the weekly Wednesday price adjustment. Decision = bridge only what's
  needed until the next known price post. No price *forecast* is made — the
  engine surfaces the known reset date, it does not predict the number.

## Efficiency Read
A per-tank diagnostic computed from one fill-to-fill interval: litres ÷ odometer
gap → real L/100km, compared to Baseline. Surfaces wasted ringgit and CO₂
together plus a likely cause. Requires at least two Fills with odometer readings,
so the demo account ships with seeded Fill history.

## Baseline
The reference L/100km the Efficiency Read compares against. Hybrid source: seeded
from a hardcoded make/model real-world spec (a small lookup table for common
Malaysian models, lab figures adjusted by a real-world correction factor), then
migrated toward the user's own rolling personal average as Fills accumulate.

## Code owns substance, LLM owns voice
The governing principle for every AI surface. Code computes all state and decides
all substance — the Verdict's action and ringgit figures, the Efficiency Read's
numbers, and the bounded set of likely causes. The LLM only renders that
substance into a human, opinionated voice and never originates a number or a
cause. Numbers are validated in code before display, so the AI cannot break or
lie on stage.

## Ask JimatJalan
A free-form question box where the user asks anything about their fuel situation
("drive to JB or take the bus?", "why not fill today?") and the LLM answers by
reasoning over their real computed state (Quota Balance, Daily Burn, Baseline,
Regime). The capability a calculator cannot replicate — the embodiment of the
"personal fuel financial-advisor" pitch and the primary Creative-AI differentiator.
Numbers in its answers are still validated in code. Built only after the hero
screen (Wallet → Verdict → Efficiency Read) is flawless; never compromises it.

## Tank Level
The estimated current fuel in the tank. Maintained as a running estimate from
Fills + Daily Burn, but surfaced on the Verdict as an adjustable default guess
the user can nudge — an estimate, never an asserted measurement. (Time-box
fallback if the running model costs too much: drop to a simple tap-time
"Empty / ¼ / ½" prompt; same UI.) Tank capacity itself is static config.
