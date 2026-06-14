# Single verdict engine, two clocks

**Status:** accepted

The Verdict must stay useful in two situations that look very different — the
BUDI95 subsidy quota (which resets monthly on the 1st) and the unsubsidised
market float for RON97/diesel/over-quota fuel (which re-prices weekly every
Wednesday). We decided to handle both with **one deterministic "bridge to the
next reset" engine** parameterised by which clock applies, rather than two
separate code paths or a price-prediction model. The Subsidy Regime reduces to a
single rule — *fill only what you need to reach the reset; never buy market
litres now that you could buy subsidised after it* — and the Float Regime runs
the same rule against the Wednesday clock. A runnable prototype
(`.scratch/jimatjalan/prototypes/verdict-engine/`) validated that the four
actions (`wait` / `bridge` / `bank` / `fill`) and the hero RM58 case fall out of
the arithmetic.

## Considered options

- **Two separate regime engines** — rejected: duplicated logic, two places to
  break on stage, and it obscured that both regimes are the same "don't overbuy
  before a known reset" idea.
- **ML / heuristic price-direction forecast for the float** — rejected: fragile,
  un-defensible to a judge, and a live-demo liability. We surface the *known*
  reprice date, never a predicted price.

## Consequences

- The Float Regime **cannot claim a ringgit saving** (`ringgitSaved` is `null`):
  with no forecast, there is no honest saving to assert. The Float verdict is
  informational; the demo leads with Subsidy-Regime cases where the saving is a
  hard number. This honesty is deliberate and survives judge scrutiny.
- Days-to-reset for both clocks are computed by a separate `resets` module and
  passed *into* the engine, keeping the engine pure and independently testable.
- A new subsidy/float ruleset (the BUDI95 rules changed twice in 2026) is a
  config/clock change, not an engine rewrite.
