import { getDemoHeroModel, toPersona } from "@/lib/demo-model";
import {
  seedQuotaConfig, seedLastWeekPrices, seedRon97Trend, seedRon97Trend7d, seedRon97Trend1y,
} from "@/data/seed";
import { nextWeeklyReset } from "@/domain/resets";
import { AppShell } from "@/components/AppShell";
import { AlertBanner, type Alert } from "@/components/AlertBanner";
import { FuelPrices } from "@/components/FuelPrices";
import { PriceTrendTabs } from "@/components/PriceTrendTabs";

export const dynamic = "force-dynamic";

export default async function PricesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const persona = toPersona((await searchParams).p);
  const model = await getDemoHeroModel(persona);
  const p = seedQuotaConfig.prices;
  const nextRevision = nextWeeklyReset(new Date()).toLocaleDateString("en-MY", {
    weekday: "short", day: "2-digit", month: "short",
  });

  // Smart alerts (module 7) from the week-over-week deltas.
  const alerts: Alert[] = [];
  const d97 = +(p.ron97 - seedLastWeekPrices.ron97).toFixed(2);
  if (d97 > 0) alerts.push({ tone: "up", text: `RON97 up RM${d97.toFixed(2)} this week — float grades pricier. Fill before ${nextRevision}.` });
  else if (d97 < 0) alerts.push({ tone: "down", text: `RON97 down RM${Math.abs(d97).toFixed(2)} — good time to fill float grades.` });
  alerts.push({ tone: "info", text: "RON95 subsidised holds at RM1.99 — your quota price is stable." });

  return (
    <AppShell subsidyRinggit={model.balance.subsidyRinggit} persona={persona}>
      <AlertBanner alerts={alerts} />
      <FuelPrices prices={p} lastWeek={seedLastWeekPrices} nextRevision={nextRevision} />
      <PriceTrendTabs d7={seedRon97Trend7d} d1m={seedRon97Trend} d1y={seedRon97Trend1y} />
    </AppShell>
  );
}
