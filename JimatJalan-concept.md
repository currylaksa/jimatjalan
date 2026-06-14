# JimatJalan — Concept Brief

> Handoff doc for Claude Code. This locks the **idea and the hero MVP**. The build details (stack specifics, schema, prompts, components) are deliberately left open for you to brainstorm and propose.

---

## 1. The hackathon

- **Event:** Vibeathon — 36-hour AI hackathon.
- **Builder:** Solo developer using Claude Code. 2 teammates handle the pitch only.
- **Platform:** Responsive web / PWA.
- **Judging (100%):** Technical 50% (Functionality 20%, Effective AI 10%, Creative AI 10%, UI/UX 10%) · Business 30% (Market 10%, Sustainability 10%, Business model 10%) · Pitch 20%.

### Case study
"Know When to Fill Up. Know How to Drive Smart. Save More Every Week." Malaysian drivers struggle with fuel cost amid price volatility. Five named problems to solve:

1. Fuel price awareness (trends, refuel timing)
2. Fuel consumption tracking
3. Driving behavior analysis
4. Refuelling optimization
5. Sustainability awareness (carbon)

---

## 2. The insight that makes this idea special

Since the **BUDI95** targeted subsidy launched, RON95 is no longer simply cheap — it's cheap *up to a monthly quota*:

- Eligible Malaysians get RON95 at **RM1.99/L**, capped at **200 L/month** (cut from 300 L on 1 Apr 2026; e-hailing/gig get 800 L).
- Quota **resets on the 1st, no rollover.**
- Once quota is gone (or you're ineligible), you pay the **unsubsidised market float** — around **RM4.07/L** — roughly **double**.
- RON97 (~RM4.85/L) and diesel (~RM4.97/L Peninsular) float **weekly**, Wednesday-to-Tuesday cycle.

> Prices above are illustrative as of late May 2026 and change weekly. Treat them as **config/seed values**, not hardcoded constants.

**The reframe nobody else uses:** your BUDI95 quota is *money the government already gave you that expires on the 1st*. Most drivers don't know their remaining balance and silently overpay. No fuel app anywhere can copy this — it encodes a 2026 Malaysia-specific ruleset that already changed twice this year. That is the moat.

---

## 3. The hero MVP — one screen

Build this flawlessly first. Everything else is optional plumbing that *feeds* this screen.

### a) Subsidy Wallet (the memory hook)
Show remaining quota as **ringgit with an expiry countdown**, not just litres.
> "12 L of RM1.99 fuel left · ≈ RM25 subsidy · resets in 6 days." Depleting bar, green → amber → red.

### b) The Verdict (the wow)
One tap ("Patut Isi?" / Should I fill?) returns a confident, often **counterintuitive** call with a hard ringgit number.
> "⛔ Don't fill up today. Only 12 L subsidised quota left — a full 40 L fill means ~28 L at RM4.07. Bridge 12 L now (RM24), fill fully after reset. **Save RM58.**"

The "don't fill" twist is what makes the AI feel like it's *reasoning*. That's the moment judges remember.

### c) Efficiency read (closes the consumption + behavior + carbon gap)
From one logged fill (litres ÷ odometer gap) compute real **L/100km**, compare to the vehicle's baseline, and surface wasted **ringgit and CO₂** together with a likely cause.
> "This tank 9.8 vs baseline 8.1 L/100km (+21%). Cost you RM34 & 15 kg CO₂. Likely: hard acceleration or low tyre pressure."

---

## 4. How the hero covers all five problems

| Case-study problem | Covered by |
|---|---|
| Fuel price awareness | Verdict + price strip reason over market vs subsidised price |
| Refuelling optimization | The wallet + verdict (the core) |
| Fuel consumption tracking | Efficiency read → real L/100km, cost/km |
| Driving behavior analysis | Efficiency-vs-baseline deviation + likely cause |
| Sustainability awareness | CO₂ on the efficiency read |

---

## 5. Design guardrails (keep it defensible on stage)

- **Money first, carbon as bonus.** Lead every read with ringgit; CO₂ rides underneath.
- **Carbon only where it's truthful.** Timing a fill saves money but burns the *same* fuel — so **no carbon claim on the timing verdict.** CO₂ belongs only on the efficiency read, where driving less/cleaner genuinely saves both. This honesty survives a judge's question.
- **Behavior is inferred, not measured.** Frame it as "we flag inefficient tanks and likely causes," never "we measured your acceleration." A number that's literally litres ÷ distance can't be poked.
- **Decision logic is deterministic; the AI writes the voice.** Code computes state (quota left, days to reset, daily burn, tank level) and decides the action so it never breaks on stage. The LLM turns that state into a human, opinionated verdict (return as JSON, validate numbers in code before display). That fusion — *LLM as a personal fuel financial-advisor* — is the "creative AI" pitch.
- **No live price-scraping on stage.** Seed a realistic price history and a demo account; present as "live-ready."
- **UI/UX is 10% of the score.** Ship something polished, not a default-template look.

---

## 6. MVP vs stretch

- **MVP (must demo live):** Subsidy Wallet → Verdict → Efficiency read. Manual fill logging is fine.
- **Stretch (only if ahead):** receipt/odometer photo scan (vision → auto-fill the log), weekly float *direction* prediction (label as directional guidance, not financial advice), family quota pooling, optional GPS "trip mode" for harsh-braking flags (fragile in a PWA — never a dependency).

---

## 7. Open for you (Claude Code) to brainstorm

These are intentionally undecided — propose options with trade-offs:

1. **Stack** for a solo dev + PWA + server-side AI key (e.g. Next.js + Supabase + Tailwind, or your call).
2. **Data model** — vehicles, fills, quota config, baselines.
3. **The verdict decision rules** — the state → action ruleset (cover: quota covers projected need; quota will run dry before reset; quota plentiful + tank low; over-quota/ineligible → switch to price-timing).
4. **The Claude prompt** that takes the computed state and returns the verdict JSON (action, litres, RM saved, one-line reason, optional carbon line).
5. **Final name** — JimatJalan (lead) / Tangki / BijakMinyak.

**Constraint reminder:** one builder, ~36 hours minus sleep. Optimize for a flawless hero screen over breadth.
