# Subsidy Wallet from seeded data (walking skeleton)

Status: ready-for-agent

## What to build

The first hero element and the walking skeleton that proves the whole stack.
Stand up the Next.js (App Router) + TypeScript + Tailwind + shadcn/ui app with a
**local-first persistence** layer behind a thin interface (so "swap to Postgres"
is a one-line answer — see PRD). Seed a single **Demo Account**: one vehicle
(make/model → tank capacity + Baseline spec), a quota-config (Quota Cap keyed to
driver type, seed prices), an Anchor, and a couple of Fills.

`quota-ledger` computes the **Quota Balance** (litres → subsidy ringgit) from
Anchor + RON95 Fills + Quota Cap; `resets` computes days to the next 1st. The
**Subsidy Wallet** renders the balance as *ringgit of subsidy* with a reset
countdown and a depleting green→amber→red bar — e.g. "≈ RM25 subsidy left ·
resets in 6 days."

Prices, caps, and reset rules are **seed/config, never hardcoded constants**.

## Acceptance criteria

- [ ] App boots with one command and renders the Wallet from the seeded Demo Account (no login wall)
- [ ] `quota-ledger` returns `{ litresLeft, subsidyRinggit, daysToReset }` from Anchor + Fills + Quota Cap
- [ ] `resets` returns correct days-to-next-1st across month/year boundaries
- [ ] Wallet shows subsidy ringgit + litres + countdown; bar colour shifts green→amber→red by remaining fraction
- [ ] Persistence sits behind a thin swappable interface; no hosted DB dependency
- [ ] `quota-ledger` and `resets` have automated tests (the two tested modules for this slice)

## Blocked by

None - can start immediately.
