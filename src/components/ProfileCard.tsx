// Vehicle & profile summary (module 10). Pure props from the hero model.
import type { HeroModel } from "@/lib/hero-model";

export function ProfileCard({ model }: { model: HeroModel }) {
  const s = model.scenario;
  const driver = s.quotaCap >= 800 ? "E-hailing / Gig" : "Private";
  const rows: [string, string][] = [
    ["Vehicle", model.vehicleName],
    ["Fuel · grade", "Petrol · RON95"],
    ["Tank capacity", `${s.tankCapacityLitres} L`],
    ["Baseline", `${model.baselineL100.toFixed(1)} L/100km`],
    ["Driver type", `${driver} · ${s.quotaCap} L cap`],
    ["Daily burn", `≈ ${s.dailyBurn.toFixed(1)} L/day`],
    ["Driving style", model.drivingStyle],
  ];
  return (
    <section className="pump-panel enter w-full max-w-md p-5" aria-label="Profile">
      <h2 className="label text-xs text-[var(--ink-dim)]">Your profile</h2>
      <ul className="mt-3 divide-y" style={{ borderColor: "var(--edge)" }}>
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-[var(--ink-dim)]">{k}</span>
            <span className="seg font-semibold capitalize text-[var(--ink)]">{v}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
