# Hero polish + accessibility pass

Status: ready-for-human

## What to build

The dedicated polish pass that earns the UI/UX 10%. Make the hero (Wallet →
Verdict → Efficiency Read, plus Ask) distinctive and production-grade — **not a
default-template look** — with strong visual hierarchy (money first), the
green→amber→red Wallet motif, confident verdict presentation, readable contrast,
large one-handed tap targets (usable at a petrol station), and BM/EN-friendly
copy. HITL: requires the user's design taste and sign-off.

## Acceptance criteria

- [ ] Hero screen looks distinctive and polished, not a default shadcn/template layout
- [ ] Money-first hierarchy is visually obvious; CO₂ is clearly secondary
- [ ] Meets basic accessibility: contrast, focus states, tap-target size
- [ ] Copy works in both BM and EN registers
- [ ] User has reviewed and signed off on the look

## Blocked by

- `01-subsidy-wallet-seeded`
- `05-verdict-float-regime-tank-adjust`
- `06-verdict-llm-voice`
- `07-efficiency-read`

## Comments

**Status kept `ready-for-human` — NOT executed in full (HITL).** Per the AFK
handoff I did only a *safe* accessibility first pass and left the design taste to
you.

### Safe pass done (no visual/design change)
- Card titles are now real `<h2>` headings (Wallet, Verdict, Efficiency Read, Ask
  JimatJalan) for screen-reader structure — Tailwind preflight makes them inherit
  size/weight, so they render pixel-identical.
- Wallet depletion bar got `aria-label="BUDI95 quota remaining"` (was a
  `role="progressbar"` with no accessible name).
- Bumped four low-contrast **interactive** text links from `white/40` → `white/60`
  ("Set up your own car", "Back to demo", "Start over", "Ask again") — `/40` on
  the dark card fails WCAG AA for interactive text.
- Tap targets on the primary actions were already ≥48–64px (buttons set
  `minHeight`); large enough for one-handed pump use.

### Design decisions left for you to approve (the UI/UX 10%)
1. **Visual identity beyond the default dark-emerald card.** Right now every
   surface is the same `var(--card)` rounded-3xl block. The hero wants a
   distinctive look (the green→amber→red money motif extended, a real type scale,
   maybe a backdrop) — that's your taste call, not an AFK one.
2. **Money-first hierarchy across the *stack*.** Within each card money leads, but
   the three cards are visually equal weight. Decide whether the Wallet/Verdict
   ringgit should dominate the page over the Efficiency Read and Ask box.
3. **BM/EN copy register.** Strings are EN with a little BM ("Patut Isi?",
   "jimat"). Decide the bilingual voice and whether to localise fully.
4. **Remaining dim decorative text** (`white/45` disclaimers, `/50` sublabels) —
   left as-is; confirm whether they should rise for contrast or stay quiet.
5. **Colour tokens** (`--accent` falls back to `#1f6feb`; action colours
   hard-coded) — should move to a confirmed palette.
6. **Focus-visible states** — relying on browser defaults; you may want custom
   focus rings matching the palette.

Verified after the safe pass: `npm test` 44 passing, `npm run build` clean.

### Design pass — "Pump Readout" direction (chosen by human, implemented this session)
Human picked the **Pump Readout** direction (of 4 proposed). Implemented across the
whole UI — still **awaiting visual sign-off** so Status stays `ready-for-human`.
- `globals.css`: pump-readout theme tokens (deep bg + green glow + film grain),
  fonts (Saira Condensed display / Saira body / Spline Sans Mono digits, via
  Google Fonts `<link>` in `layout.tsx`), and component classes — `.pump-panel`
  (bezel), `.readout` (recessed LED well), `.seg` (glowing mono counter digits),
  `.led-dot` (pulsing status), `.pump-btn` (amber trigger), `.bar-fill` (depletion
  reveal), `.enter` + nth-child staggered page-load.
- All cards (Wallet, Verdict, Efficiency, Ask) + onboarding restyled to the bezel/
  LED look; **logic & props untouched**. Money sits in the big LED wells.
- Still open for the human: final palette sign-off, whether to deepen page-level
  money hierarchy further, BM/EN copy register, custom focus rings.

Verified: `npm test` 44 passing, `npm run build` clean, both pages serve 200 with
the theme (pump-panel/seg/led-dot/bar-fill present in rendered HTML).
