import { buildHeroModel, type HeroModel } from "./hero-model";
import type { Fill } from "@/domain/types";
import {
  seedVehicle, seedQuotaConfig, seedProfile, seedAnchor, seedFills,
  rahmanVehicle, rahmanQuotaConfig, rahmanProfile, rahmanAnchor, rahmanFills,
} from "@/data/seed";
import { readSession } from "./session";

export type Persona = "aisyah" | "rahman";

export function toPersona(p?: string | string[]): Persona {
  return p === "rahman" ? "rahman" : "aisyah";
}

// Aisyah = the live account: seed history + this browser's logged fills / re-anchor
// (cookie). Rahman = a read-only e-hailing scenario (the date-robust BANK wedge).
export async function getDemoHeroModel(persona: Persona = "aisyah"): Promise<HeroModel> {
  const today = new Date();
  if (persona === "rahman") {
    return buildHeroModel({
      vehicle: rahmanVehicle, quotaConfig: rahmanQuotaConfig, profile: rahmanProfile,
      anchor: rahmanAnchor, fills: rahmanFills, today,
    });
  }
  const s = await readSession();
  return buildHeroModel({
    vehicle: seedVehicle,
    quotaConfig: seedQuotaConfig,
    profile: seedProfile,
    anchor: s.anchor ?? seedAnchor,
    fills: [...seedFills, ...s.fills],
    today,
  });
}

export async function getDemoFills(persona: Persona = "aisyah"): Promise<Fill[]> {
  const fills =
    persona === "rahman" ? rahmanFills : [...seedFills, ...(await readSession()).fills];
  return [...fills].sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
