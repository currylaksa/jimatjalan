// Builds the hero view-model (Wallet + Verdict + Efficiency) from raw account
// data. Pure composition of domain functions — usable on server (seeded Demo
// Account) and client (the just-onboarded account). today is passed in.

import type { Vehicle, QuotaConfig, Profile, Anchor, Fill } from "@/domain/types";
import type { VerdictScenario } from "@/domain/verdict-engine";
import type { EfficiencyResult } from "@/domain/efficiency-analyzer";
import { computeQuotaBalance } from "@/domain/quota-ledger";
import { estimateDailyBurn } from "@/domain/consumption-model";
import { resolveBaseline } from "@/domain/baseline-model";
import { analyzeEfficiency } from "@/domain/efficiency-analyzer";
import { nextWeeklyReset, daysUntil } from "@/domain/resets";
import type { QuotaBalance } from "@/domain/types";

export interface HeroModel {
  vehicleName: string;
  balance: QuotaBalance;
  quotaCap: number;
  scenario: VerdictScenario;
  baselineL100: number;
  co2PerLitreKg: number;
  efficiency: EfficiencyResult | null;
}

interface Input {
  vehicle: Vehicle;
  quotaConfig: QuotaConfig;
  profile: Profile;
  anchor?: Anchor;
  fills: Fill[];
  today: Date;
}

export function buildHeroModel(i: Input): HeroModel {
  const { vehicle, quotaConfig, profile, anchor, fills, today } = i;

  const balance = computeQuotaBalance({
    anchor,
    fills,
    quotaCap: quotaConfig.quotaCap,
    prices: quotaConfig.prices,
    today,
  });

  const dailyBurn = estimateDailyBurn({
    selfReportKmPerDay: profile.selfReportKmPerDay,
    vehicleEfficiencyL100: vehicle.baselineSpecL100,
    fills,
  });

  const scenario: VerdictScenario = {
    gradeConsidering: "RON95",
    eligible: true,
    quotaCap: quotaConfig.quotaCap,
    quotaLitresLeft: balance.litresLeft,
    dailyBurn,
    tankLevelLitres: profile.tankLevelLitres,
    tankCapacityLitres: vehicle.tankCapacityLitres,
    daysToSubsidyReset: balance.daysToReset,
    daysToFloatReset: daysUntil(today, nextWeeklyReset(today)),
    prices: quotaConfig.prices,
    config: { reserveDays: 2 },
  };

  const baselineL100 = resolveBaseline({
    makeModelSpecL100: vehicle.baselineSpecL100,
    personalFills: fills,
  });

  const byDate = [...fills].sort((a, b) => +new Date(a.at) - +new Date(b.at));
  const efficiency =
    byDate.length >= 2
      ? analyzeEfficiency({
          fillPair: [byDate[byDate.length - 2], byDate[byDate.length - 1]],
          baselineL100,
          prices: quotaConfig.prices,
          co2PerLitreKg: quotaConfig.co2PerLitreKg,
          driverType: vehicle.driverType,
        })
      : null;

  return {
    vehicleName: vehicle.makeModel,
    balance,
    quotaCap: quotaConfig.quotaCap,
    scenario,
    baselineL100,
    co2PerLitreKg: quotaConfig.co2PerLitreKg,
    efficiency,
  };
}
