# Re-anchor the Wallet ("Correct balance")

Status: ready-for-agent

## What to build

An always-available "Correct balance" affordance on the Subsidy Wallet (quiet,
secondary) that lets the user set their current remaining quota to a known
ground-truth value read from the official BUDI95 app or a receipt. This re-Anchors
the Quota Balance — the honesty valve for estimate drift, so a missed Fill can be
corrected in one tap rather than poisoning every Verdict until the next reset.

## Acceptance criteria

- [ ] "Correct balance" control is reachable from the Wallet, visually secondary
- [ ] Setting a value creates a new Anchor; `quota-ledger` projects forward from it
- [ ] Wallet immediately reflects the corrected balance
- [ ] Subsequent Fills decrement from the re-Anchored value, not the old estimate

## Blocked by

- `01-subsidy-wallet-seeded`

## Comments

Built (post-grill). `CorrectBalance.tsx` — quiet "Correct balance" link on the
Wallet → `correctBalance` server action → `store.setAnchor`. Ledger projects
forward from the new Anchor; prior fills (before it) are ignored; later fills
decrement from the corrected value. Verified in `tests/store-mutations.test.ts`
(re-anchor → 50 L, next RON95 fill → 44). `npm test` 49 passing, build clean.
