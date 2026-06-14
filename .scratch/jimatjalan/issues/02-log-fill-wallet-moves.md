# Log a Fill → Wallet moves

Status: ready-for-agent

## What to build

A fill-logging form (litres, ringgit paid, fuel grade, odometer) that persists a
**Fill** and updates the hero in real time. A RON95 Fill decrements the Quota
Balance via `quota-ledger`; the Subsidy Wallet re-renders to reflect the new
remaining subsidy. Non-RON95 grades are recorded but do not touch the Quota
Balance.

## Acceptance criteria

- [ ] Form captures litres, ringgit, grade, odometer and persists a Fill
- [ ] Logging a RON95 Fill decrements Quota Balance and the Wallet bar visibly drops
- [ ] Logging a RON97/diesel Fill does not change the Quota Balance
- [ ] Odometer is stored on the Fill (feeds the later Efficiency Read)
- [ ] Demoable end to end: add a fill, watch the Wallet move

## Blocked by

- `01-subsidy-wallet-seeded`

## Comments

Built (post-grill). `LogFill.tsx` (Home + Tank) → `logFill` server action
(`src/app/actions.ts`) → `store.addFill` + `revalidatePath`. RON95 decrements the
Quota Balance (Wallet + Verdict re-render); RON97/diesel recorded but ignored by
the ledger; odometer stored (feeds Efficiency). Pages `force-dynamic` to reflect
the mutation. Integration test `tests/store-mutations.test.ts` proves the seam
(12→8 on RON95, unchanged on RON97). `npm test` 49 passing, build clean.
