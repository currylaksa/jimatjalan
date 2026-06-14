import { getDemoHeroModel, toPersona } from "@/lib/demo-model";
import { seedMonthlySpend } from "@/data/seed";
import { AppShell } from "@/components/AppShell";
import { SubsidyWallet } from "@/components/SubsidyWallet";
import { CorrectBalance } from "@/components/CorrectBalance";
import { DashboardTiles } from "@/components/DashboardTiles";
import { MonthlyBars } from "@/components/MonthlyBars";
import { MonthlyReport } from "@/components/MonthlyReport";
import { Verdict } from "@/components/Verdict";
import { LogFill } from "@/components/LogFill";

// Reads the mutable in-memory store; must reflect logged fills / re-anchors.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const persona = toPersona((await searchParams).p);
  const model = await getDemoHeroModel(persona);
  const live = persona === "aisyah"; // Rahman is a read-only showcase

  return (
    <AppShell subsidyRinggit={model.balance.subsidyRinggit} persona={persona}>
      <SubsidyWallet balance={model.balance} quotaCap={model.quotaCap} />
      {live && <CorrectBalance />}
      <DashboardTiles model={model} />
      <MonthlyBars data={seedMonthlySpend} />
      <MonthlyReport model={model} />
      <Verdict scenario={model.scenario} />
      {live && <LogFill />}
    </AppShell>
  );
}
