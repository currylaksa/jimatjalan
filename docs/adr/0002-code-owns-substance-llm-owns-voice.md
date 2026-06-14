# Code owns substance, LLM owns voice

**Status:** accepted

Every AI surface in JimatJalan (the Verdict, the Efficiency Read's likely cause,
and Ask JimatJalan) splits responsibility the same way: **deterministic code
computes all substance** — every litre, every ringgit figure, the chosen action,
and the bounded set of likely causes — and the **LLM only renders that substance
into a human, opinionated voice.** The LLM never originates a number or a cause.
All figures are validated in code against the computed state *before* display.

## Why

- **It cannot break on stage.** The decision logic is deterministic, so a flaky
  model, a bad completion, or a network hiccup degrades the *voice*, never the
  *answer*. Surfaces fall back to a deterministic rendering rather than going
  blank or wrong.
- **It cannot lie.** A number-validation guard rejects/repairs any LLM payload
  whose figures disagree with the computed substance, so the app never shows a
  hallucinated saving or a fabricated cause. This is what makes "how do you know?"
  answerable on stage.

## Considered options

- **LLM decides the action / computes the numbers** — rejected: un-reproducible,
  un-testable, and a single confident-but-wrong verdict destroys trust with
  judges. We give up some apparent "AI magic" in the decision layer to buy
  total reliability.

## Consequences

- The AI can look *cosmetic* ("it's just formatting the calculator"). This is
  answered not by loosening the rule but by **Ask JimatJalan** — grounded
  free-form reasoning over the user's real state, a capability a calculator
  cannot replicate, while numbers stay code-validated.
- Implies a stable contract between the deterministic modules and `llm-voice`:
  modules emit a typed decision/result object with a bounded `reasonCode`; the
  LLM consumes it and returns voiced text keyed to that object.
