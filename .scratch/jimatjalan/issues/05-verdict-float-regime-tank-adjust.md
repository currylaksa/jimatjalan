# Verdict — float regime + tank-level adjust

Status: ready-for-agent

## What to build

Extend the `verdict-engine` to the **float regime**: when quota is exhausted, the
driver is ineligible, or the grade is RON97/diesel, the same "bridge to the next
known reset" logic runs against the **weekly Wednesday** clock instead of the 1st.
Critically, `ringgitSaved` is **`null`** — we surface the known reprice date, we
do **not** forecast the price, so no saving is claimed (ADR-0001).

Also add the **adjustable Tank Level guess** on the Verdict: the running estimate
is shown as a default the user can nudge, never asserted as a measurement.
(Time-box fallback if the running estimate is costly: a tap-time "Empty / ¼ / ½"
prompt — same UI.)

## Acceptance criteria

- [ ] RON97/diesel/over-quota/ineligible cases run the float regime against the Wednesday clock
- [ ] Float verdicts return `ringgitSaved: null` and read as directional, never a guaranteed saving
- [ ] Verdict shows an adjustable Tank Level the user can nudge; the verdict recomputes on change
- [ ] `verdict-engine` tests assert `ringgitSaved === null` for every float case
- [ ] Switching the considered grade flips the regime correctly

## Blocked by

- `04-verdict-subsidy-regime`

## Comments

Built (AFK). Float regime arrived with the `04` port; `05` locks it and corrects
one contract gap.

- **Engine:** `FLOAT_TANK_FINE` (wait) now returns `ringgitSaved: null` (was `0`)
  — float **never** claims a saving (ADR-0001), so `ringgitSaved === null` holds
  for *every* float case now. Tests in `tests/verdict-engine.test.ts` assert
  float for RON97, diesel, over-quota (0 L left), and ineligible RON95; that the
  bridge runs the Wednesday clock; and that grade flips regime correctly.
- **UI:** `Verdict.tsx` gains an adjustable **Tank Level** slider (0…tank
  capacity), labelled "your guess" — the verdict recomputes live as you nudge it
  (e.g. empty → bridge/fill, full → wait). This is the CONTEXT time-box fallback
  shape (a tap-time guess), never an asserted measurement.

Not done: a user-facing grade switcher. The regime-flip is covered at the engine
level + tests; a grade toggle is a demo nicety, not required by the criteria.

Verified: `npm test` 28 passing (pristine), `npm run build` clean.
