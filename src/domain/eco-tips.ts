// Eco-driving coach (challenge #3): practical ways to cut fuel + emissions, keyed
// to the Efficiency Read's detected causes. Code owns the advice (bounded, like
// the cause menu) — never an LLM free-styling a tip. Less fuel = less CO₂, so the
// same fixes save money and emissions. Pure.

export interface EcoTip {
  cause: string;
  title: string;
  body: string;
}

const TIPS: Record<string, Omit<EcoTip, "cause">> = {
  "tyre pressure": {
    title: "Check tyre pressure monthly",
    body: "Under-inflated tyres can waste ~3% fuel. Top up to the door-sticker PSI.",
  },
  "hard acceleration": {
    title: "Anticipate braking, ease the throttle",
    body: "Coast into stops instead of accelerating hard then braking — smoother driving cuts city fuel up to ~10–15%.",
  },
  idling: {
    title: "Reduce idle time at traffic lights",
    body: "If safe, switch off for stops longer than 60s — saves ~0.3–0.5 L/day in urban commuting.",
  },
  "AC load": {
    title: "Ease the air-con in light traffic",
    body: "Max AC adds ~5–10% load. Use vents when it's cool; recirculate to cool faster.",
  },
  "short trips": {
    title: "Combine short trips",
    body: "Cold engines burn richer. Batch errands into one warm run instead of several cold starts.",
  },
  cargo: {
    title: "Drop the dead weight",
    body: "Clear the boot and remove roof racks when unused — extra weight and drag cost fuel.",
  },
};

/** Up to 3 tips, in the order the causes were detected. */
export function ecoTips(causes: string[]): EcoTip[] {
  return causes
    .filter((c) => c in TIPS)
    .slice(0, 3)
    .map((c) => ({ cause: c, ...TIPS[c] }));
}
