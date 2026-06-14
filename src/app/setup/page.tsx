import { getDemoHeroModel, toPersona } from "@/lib/demo-model";
import { AppShell } from "@/components/AppShell";
import { ProfileCard } from "@/components/ProfileCard";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const persona = toPersona((await searchParams).p);
  const model = await getDemoHeroModel(persona);
  return (
    <AppShell subsidyRinggit={model.balance.subsidyRinggit} persona={persona}>
      <ProfileCard model={model} />
      <OnboardingFlow />
    </AppShell>
  );
}
