"use client";

// Ask JimatJalan (issue 09) — the free-form advisor, grounded server-side over
// the driver's real computed state. Numbers in the answer are code-validated in
// the route. Sits below the hero and never blocks it.
import { useState } from "react";
import type { VerdictScenario } from "@/domain/verdict-engine";

const SUGGESTIONS = [
  "Why not fill today?",
  "Will I run out before reset?",
  "Drive to JB or take the bus?",
];

export function AskBox({
  scenario,
  baselineL100,
  vehicleName,
}: {
  scenario: VerdictScenario;
  baselineL100: number;
  vehicleName: string;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario, baselineL100, vehicle: vehicleName, question: trimmed }),
      });
      const data = await res.json();
      setAnswer(typeof data?.text === "string" ? data.text : "Sorry, I couldn't work that out.");
    } catch {
      setAnswer("Sorry, I couldn't reach the advisor just now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Ask JimatJalan">
      <h2 className="label text-xs text-[var(--ink-dim)]">Ask JimatJalan</h2>
      <p className="mt-1 text-xs text-[var(--ink-dim)]">
        Anything about your fuel — grounded in your real numbers.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question…"
          className="w-full rounded-xl bg-[var(--panel-inset)] px-4 py-3 text-sm text-[var(--ink)] outline-none"
          style={{ minHeight: 48, border: "1px solid var(--edge)" }}
          aria-label="Your question"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="pump-btn px-5 text-sm font-bold disabled:opacity-40"
          style={{ minHeight: 48 }}
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              ask(s);
            }}
            className="rounded-full px-3 py-1 text-xs text-[var(--ink-dim)]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--edge)" }}
          >
            {s}
          </button>
        ))}
      </div>

      {answer && (
        <p
          className="mt-4 rounded-xl p-4 text-base leading-relaxed text-[var(--ink)]"
          style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)" }}
        >
          {answer}
        </p>
      )}
    </section>
  );
}
