import { getDemoHeroModel, getDemoFills, toPersona } from "@/lib/demo-model";
import { AppShell } from "@/components/AppShell";
import { EfficiencyRead } from "@/components/EfficiencyRead";
import { DrivingStyle } from "@/components/DrivingStyle";
import { EcoTips } from "@/components/EcoTips";
import { FillHistory } from "@/components/FillHistory";
import { LogFill } from "@/components/LogFill";

// Reflects newly logged fills.
export const dynamic = "force-dynamic";

export default async function TankPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const persona = toPersona((await searchParams).p);
  const model = await getDemoHeroModel(persona);
  const fills = await getDemoFills(persona);
  return (
    <AppShell subsidyRinggit={model.balance.subsidyRinggit} persona={persona}>
      {model.efficiency ? (
        <>
          <EfficiencyRead result={model.efficiency} baselineL100={model.baselineL100} />
          <DrivingStyle current={model.drivingStyle} live={persona === "aisyah"} />
          <EcoTips causes={model.efficiency.causeCandidates} />
        </>
      ) : (
        <section className="pump-panel enter w-full max-w-md p-5">
          <h2 className="label text-xs text-[var(--ink-dim)]">This tank&apos;s efficiency</h2>
          <p className="mt-3 text-sm text-[var(--ink-dim)]">
            Log two fills with odometer readings to see your real L/100km.
          </p>
        </section>
      )}
      <FillHistory fills={fills} />
      {persona === "aisyah" && <LogFill />}
    </AppShell>
  );
}
