# JimatJalan — Business Case

Maps to the Vibeathon **Business (30%)** rubric: Market & Demand · Sustainability &
Growth · Business Model & Value. `[VERIFY: …]` = insert a sourced figure before pitch
(do not present a fabricated number).

---

## 1. Market & Demand (10%)

**Problem, sized.** Malaysia's **BUDI95** reform turns RON95 from a flat subsidised
price into a **monthly per-driver quota** — overnight, every RON95 driver has a
"use-it-or-lose-it" allowance most don't track. That's a nationwide behaviour-change
moment, not a niche tool.

- Total market: RON95 drivers in Malaysia ≈ **[VERIFY: ~__M vehicles / drivers]**.
- Beachhead (wedge): **e-hailing + gig/delivery drivers** ≈ **[VERIFY: ~__k active
  drivers]**, fuel = their single largest variable cost (**[VERIFY: ~RM__/month]**).
- **Why now:** BUDI95's 2025–26 rollout (and the fact it has already been revised
  twice in 2026) makes quota literacy suddenly valuable *and* keeps changing —
  recurring need, not a one-off.

**Demand signals to cite:** quota anxiety in driver forums/FB groups; e-hailing margin
pressure; the fact that the official BUDI95 app shows the balance but gives **no
advice** (it tells you *what*, not *what to do*). `[VERIFY: 1–2 concrete signals.]`

**Pain → our answer (the five case-study problems):** refuel timing (Verdict),
consumption visibility (Efficiency Read + Score), emissions awareness (CO₂ on the
read), fragmentation (one app: wallet + verdict + efficiency + advisor), spend
prediction (Predicted Spend).

---

## 2. Business Model & Value (10%)

**Value proposition:** *"Save money, cut fuel waste, drive greener — with AI that
tells you the smart move and can't lie about the numbers."*

**Competitive advantage (moat):**
- Not the formula (copyable) — the **segment-tuned model** (Quota Cap 200/800,
  bridge-vs-bank) incumbents' generic wallets don't have, plus **per-driver data**
  (personal Baseline + fill cadence) that compounds into switching cost.
- The **"code owns substance, AI owns voice"** guardrail: numbers are computed +
  validated, so the advisor **can't hallucinate a saving** — a trust edge a generic
  LLM wrapper can't claim.
- vs incumbents (Setel/Touch'nGo/Maybank bundling it free): we win the **high-pain
  segment + fleet B2B**, not consumer-mass head-on.

**Revenue (insert numbers before pitch):**
| Stream | What | Price |
|---|---|---|
| **Freemium — consumer** | Free: wallet, verdict, one vehicle. Premium: multi-vehicle, full history/trends, advanced advisor, re-anchor reminders | **[VERIFY: ~RM__/mo]** |
| **B2B — fleet** | E-hailing/logistics fleet dashboard: per-driver efficiency, fuel-spend + **corporate sustainability/CO₂ reporting** | **[VERIFY: ~RM__/driver/mo]** |
| **Partnerships** | Petrol stations (targeted offers), insurers (eco-score → premiums), automotive service (efficiency-flag → service) | rev-share / referral |

**Financial sustainability:** marginal cost ≈ one cheap LLM call per advice
(Haiku ≈ fraction of a sen), and the deterministic core means most value is served at
**zero** AI cost — gross margin scales with usage.

---

## 3. Sustainability & Growth (10%)

**Roadmap (land-and-expand):**
1. **Now** — consumer wedge: wallet + verdict + efficiency + advisor (this build).
2. **Next** — e-hailing/gig depth: cost/km, shift planning, fill-cadence learning →
   convert to **fleet B2B** dashboards + sustainability reporting.
3. **Later** — partnerships (stations/insurers); family quota pooling; receipt/odometer
   vision scan; live BUDI95 / station integration (designed-for, not required).

**Scalability (built in, not bolted on):**
- **Config-driven engine** — Quota Cap, prices, reset clocks are *data*; new
  segments/regimes are config, not code (ADR-0001).
- **Swappable persistence** — `Store` adapter (local-first today) → Postgres/KV is a
  second implementation, no domain changes.
- **Cheap unit economics** — deterministic core + small LLM calls; degrades to a
  zero-cost deterministic mode under load or outage.

**Adaptability (de-risks the one-policy dependency):** the product is a **fuel-spend
optimiser for any subsidy/price regime**, with BUDI95 as today's instance. The
two-clock engine already runs the **Float Regime** (post-quota / RON97 / diesel /
weekly reprice). If Putrajaya changes BUDI95 → a config edit, not a rewrite. This is
the answer to *"what happens when the policy changes?"*

---

*Demo robustness (supports "financial sustainability / cannot fail"): per-session
cookie state (serverless-safe), self-hosted fonts (no third-party runtime
dependency), and an AI layer that falls back to a deterministic, number-exact voice
if the model/network/credit is unavailable.*
