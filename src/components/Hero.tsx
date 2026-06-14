// The hero stack — Wallet → Verdict → Efficiency Read — from a built model.
// Plain component so both the seeded server page and the client onboarding result
// can render it.
import type { HeroModel } from "@/lib/hero-model";
import { SubsidyWallet } from "./SubsidyWallet";
import { Verdict } from "./Verdict";
import { EfficiencyRead } from "./EfficiencyRead";
import { AskBox } from "./AskBox";

export function Hero({ model }: { model: HeroModel }) {
  return (
    <>
      <SubsidyWallet balance={model.balance} quotaCap={model.quotaCap} />
      <Verdict scenario={model.scenario} />
      {model.efficiency && (
        <EfficiencyRead result={model.efficiency} baselineL100={model.baselineL100} />
      )}
      <AskBox
        scenario={model.scenario}
        baselineL100={model.baselineL100}
        vehicleName={model.vehicleName}
      />
    </>
  );
}
