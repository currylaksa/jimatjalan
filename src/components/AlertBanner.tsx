// Smart alerts (module 7) — in-app banners. Pure props; caller computes items.
export interface Alert {
  tone: "up" | "down" | "info";
  text: string;
}

const STYLE = {
  up: { bg: "rgba(217,45,45,0.1)", fg: "var(--led-red)", icon: "▲" },
  down: { bg: "rgba(18,161,80,0.1)", fg: "var(--led-green)", icon: "▼" },
  info: { bg: "rgba(255,176,32,0.12)", fg: "var(--amber)", icon: "●" },
} as const;

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section className="enter w-full max-w-md flex flex-col gap-2" aria-label="Alerts">
      {alerts.map((a, i) => {
        const s = STYLE[a.tone];
        return (
          <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: s.bg, border: `1px solid ${s.fg}` }}>
            <span className="seg font-bold" style={{ color: s.fg }}>{s.icon}</span>
            <span className="text-[var(--ink)]">{a.text}</span>
          </div>
        );
      })}
    </section>
  );
}
