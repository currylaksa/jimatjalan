import { getDemoHeroModel, toPersona } from "@/lib/demo-model";
import { seedQuotaConfig, seedLastWeekPrices, seedRon97Trend } from "@/data/seed";
import { nextWeeklyReset } from "@/domain/resets";
import { AppShell } from "@/components/AppShell";
import { FuelPrices } from "@/components/FuelPrices";
import { PriceTrend } from "@/components/PriceTrend";

export const dynamic = "force-dynamic";

export default async function PricesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const persona = toPersona((await searchParams).p);
  const model = await getDemoHeroModel(persona); // for the shell chip + persona toggle
  const nextRevision = nextWeeklyReset(new Date()).toLocaleDateString("en-MY", {
    weekday: "short", day: "2-digit", month: "short",
  });

  return (
    <AppShell subsidyRinggit={model.balance.subsidyRinggit} persona={persona}>
      <FuelPrices prices={seedQuotaConfig.prices} lastWeek={seedLastWeekPrices} nextRevision={nextRevision} />
      <PriceTrend series={seedRon97Trend} />
    </AppShell>
  );
}
