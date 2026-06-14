# JimatJalan — Architecture

How the modules from the PRD fit together. Locks the **interfaces** before
implementation so issues can be built against stable contracts. Domain language
follows `CONTEXT.md`; decisions follow `docs/adr/`.

## Layering & the one dependency rule

```
app/  (Next.js UI + route handlers)
ai/   (llm-voice — server only)        ┐
data/ (persistence + Demo Account seed)│  all depend DOWN onto domain/
        │                              ┘
        ▼
domain/ (pure logic — NO I/O, no React, no fetch, no Date.now inside fns)
```

**The rule:** `domain/` imports nothing from `app/`, `ai/`, or `data/`. It is
pure functions over plain data — `today: Date` and all state are passed *in*.
This is what makes `verdict-engine`, `quota-ledger`, and `resets` testable in
isolation (the three tested modules) and keeps the deterministic substance
independent of the LLM and the store (ADR-0002).

## Core domain types (`domain/types.ts`)

```ts
type FuelGrade = 'RON95' | 'RON97' | 'diesel';
type DriverType = 'private' | 'ehailing' | 'gig';

interface Prices { subsidised: number; ron95Market: number; ron97: number; diesel: number; }
interface Vehicle { id: string; makeModel: string; tankCapacityLitres: number; baselineSpecL100: number; driverType: DriverType; }
interface Fill { id: string; vehicleId: string; litres: number; ringgit: number; grade: FuelGrade; odometerKm: number; at: string; } // ISO
interface Anchor { quotaLitres: number; at: string; }       // ISO
interface QuotaConfig { quotaCap: number; prices: Prices; } // SEED/CONFIG, not constants
```

## Module contracts (`domain/`)

```ts
// resets.ts — the two clocks (ADR-0001). Pure date math.
function nextMonthlyReset(today: Date): Date;     // next 1st
function nextWeeklyReset(today: Date): Date;       // next Wednesday reprice
function daysUntil(today: Date, target: Date): number;

// quota-ledger.ts — the spine. Quota Balance is an ESTIMATE, re-anchorable.
function computeQuotaBalance(i: {
  anchor?: Anchor; fills: Fill[]; quotaCap: number; prices: Prices; today: Date;
}): { litresLeft: number; subsidyRinggit: number; daysToReset: number };
// litresLeft = clamp(anchorOrCap − RON95 litres since anchor)
// subsidyRinggit = litresLeft × (ron95Market − subsidised)   // "≈ RM25 subsidy"

// consumption-model.ts — seeded for MVP; refinement optional (PRD).
function estimateDailyBurn(i: { selfReportKmPerDay?: number; vehicleEfficiencyL100: number; fills: Fill[]; }): number;
function estimateTankLevel(i: { lastFill?: Fill; dailyBurn: number; tankCapacityLitres: number; today: Date; }): number;

// verdict-engine.ts — crown jewel. Lifted from the validated prototype.
function decideVerdict(s: VerdictScenario): VerdictDecision;
// VerdictDecision = { regime, resetClock, daysToReset, action: 'wait'|'bridge'|'bank'|'fill',
//   recommendLitresNow, ringgitNow, ringgitSaved: number|null, reasonCode, carbonClaimable: false }
// days-to-reset passed IN from resets; ringgitSaved is null in float regime (ADR-0001)

// baseline-model.ts — hybrid spec→personal.
function resolveBaseline(i: { makeModelSpecL100: number; personalFills: Fill[]; }): number;

// efficiency-analyzer.ts — third pillar. Cause from a BOUNDED menu (ADR-0002).
function analyzeEfficiency(i: { fillPair: [Fill, Fill]; baselineL100: number; prices: Prices; co2PerLitreKg: number; }):
  { l100: number; deviationPct: number; wastedRinggit: number; wastedCo2Kg: number; causeCandidates: string[] };
```

## AI boundary (`ai/`, server-only)

```ts
// llm-voice.ts — code owns substance, LLM owns voice (ADR-0002). Model: claude-opus-4-8.
function voiceVerdict(d: VerdictDecision): Promise<string>;
function voiceEfficiency(r: EfficiencyResult): Promise<string>;
function askAdvisor(state: ComputedState, question: string): Promise<string>;
// validate.ts — guard: every number in the LLM payload must match the computed
// substance, else repair or fall back to a deterministic rendering (never blank).
```

`ai/` is reached only through Next.js **route handlers** (`app/api/*`) so the
Claude key stays server-side. If a call fails, the UI renders the deterministic
voice from the decision object.

## Persistence (`data/`)

```ts
// store.ts — thin interface; "swap to Postgres" = a second impl (PRD scalability story).
interface Store {
  getVehicle(): Vehicle; listFills(): Fill[]; addFill(f: Fill): void;
  getAnchor(): Anchor | undefined; setAnchor(a: Anchor): void; getQuotaConfig(): QuotaConfig;
}
// local-store.ts — local-first impl (in-memory/JSON or SQLite). No hosted DB.
// seed.ts — the single Demo Account: vehicle, quota-config, anchor, ≥2 fills,
//           seeded daily burn + believable tank level.
```

## Proposed layout

```
src/
  domain/  types.ts resets.ts quota-ledger.ts consumption-model.ts
           verdict-engine.ts baseline-model.ts efficiency-analyzer.ts
  ai/      llm-voice.ts prompts.ts validate.ts
  data/    store.ts local-store.ts seed.ts
  app/     page.tsx  api/voice/route.ts  api/ask/route.ts
  components/ SubsidyWallet.tsx Verdict.tsx EfficiencyRead.tsx AskBox.tsx FillForm.tsx
tests/     verdict-engine.test.ts quota-ledger.test.ts resets.test.ts
```

## Notes

- The validated `decideVerdict` logic in
  `.scratch/jimatjalan/prototypes/verdict-engine/` is lifted into
  `domain/verdict-engine.ts` (port .mjs→.ts); the prototype presets seed the
  test table. Delete the prototype once absorbed.
- No Verdict route is strictly needed — `decideVerdict` runs server-side inside
  the voice route, or client-side then voiced. Kept out of the API surface to
  stay minimal.
