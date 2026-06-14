// "Improve your score" — practical, personalised fuel + emissions advice keyed to
// the detected causes (challenge #3). Code-owned tips; CO₂ framing ties money to
// emissions. Pure props.
import Link from "next/link";
import { ecoTips } from "@/domain/eco-tips";

const ACCENTS = ["var(--led-green)", "var(--led-amber)", "#1f8fd1"];

export function EcoTips({ causes }: { causes: string[] }) {
  const tips = ecoTips(causes);
  if (tips.length === 0) return null;

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Improve your score">
      <h2 className="label text-xs text-[var(--ink-dim)]">Improve your score</h2>
      <p className="mt-1 text-xs text-[var(--ink-dim)]">
        Less fuel burned = less CO₂ — these fixes save money and emissions.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {tips.map((t, i) => (
          <li
            key={t.cause}
            className="rounded-xl p-3"
            style={{ background: "var(--panel-inset)", borderLeft: `3px solid ${ACCENTS[i % 3]}` }}
          >
            <div className="font-semibold text-[var(--ink)]">{t.title}</div>
            <div className="mt-0.5 text-sm text-[var(--ink-dim)]">{t.body}</div>
          </li>
        ))}
      </ul>
      <Link
        href="/ask"
        className="mt-3 inline-block text-xs font-semibold underline underline-offset-2"
        style={{ color: "var(--amber)" }}
      >
        More eco tips → ask the coach
      </Link>
    </section>
  );
}
