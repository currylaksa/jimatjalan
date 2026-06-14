import { getDemoHeroModel, toPersona } from "@/lib/demo-model";
import { AppShell } from "@/components/AppShell";
import { AskBox } from "@/components/AskBox";

export const dynamic = "force-dynamic";

export default async function AskPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const persona = toPersona((await searchParams).p);
  const model = await getDemoHeroModel(persona);
  return (
    <AppShell subsidyRinggit={model.balance.subsidyRinggit} persona={persona}>
      <AskBox
        scenario={model.scenario}
        baselineL100={model.baselineL100}
        vehicleName={model.vehicleName}
      />
    </AppShell>
  );
}
