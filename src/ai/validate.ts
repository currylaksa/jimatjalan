// The number-validation guard (ADR-0002: "it cannot lie"). Every substantive
// figure the LLM voices — ringgit, litres, days — must match a number the
// verdict-engine computed. A stray or altered figure fails the check and the
// caller falls back to the deterministic voice. Pure, no secrets.

import type { VerdictDecision } from "@/domain/verdict-engine";

const near = (x: number, v: number) => Math.abs(x - v) < 0.01 || x === Math.round(v);

/** Does every RM / litre / day figure in `text` match the computed decision? */
export function isVoiceFaithful(text: string, d: VerdictDecision): boolean {
  const ringgit = [d.ringgitNow, d.ringgitSaved].filter((n): n is number => n != null).concat(0);
  const litres = [d.recommendLitresNow, d.subsidisedNow, d.marketNow].filter(
    (n): n is number => n != null,
  );
  const days = [d.daysToReset];

  const all = (re: RegExp, allowed: number[]) => {
    for (const m of text.matchAll(re)) {
      const x = parseFloat(m[1]);
      if (!allowed.some((v) => near(x, v))) return false;
    }
    return true;
  };

  // Only validate numbers making a substantive claim — "RM58.24", "12 L",
  // "6 day(s)". Bare numbers like "the 1st" or "RON95" are not figures.
  return (
    all(/RM\s?(\d+(?:\.\d+)?)/gi, ringgit) &&
    all(/(\d+(?:\.\d+)?)\s?(?:L\b|litre)/gi, litres) &&
    all(/(\d+(?:\.\d+)?)\s?day/gi, days)
  );
}

/**
 * Ask JimatJalan guard: every RM / litre figure in a free-form answer must match
 * a number from the driver's computed state (ADR-0002). Qualitative answers with
 * no figures pass; a fabricated number fails so the caller can fall back.
 */
export function isAnswerGrounded(
  text: string,
  allowed: { ringgit: number[]; litres: number[] },
): boolean {
  const ok = (re: RegExp, values: number[]) => {
    for (const m of text.matchAll(re)) {
      const x = parseFloat(m[1]);
      if (!values.some((v) => near(x, v))) return false;
    }
    return true;
  };
  return (
    ok(/RM\s?(\d+(?:\.\d+)?)/gi, allowed.ringgit) &&
    ok(/(\d+(?:\.\d+)?)\s?(?:L\b|litre)/gi, allowed.litres)
  );
}
