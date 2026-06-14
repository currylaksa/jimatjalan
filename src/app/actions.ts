"use server";

// Server actions for the two write paths (issues 02 + 03). State lives in a
// per-browser cookie (src/lib/session.ts) so it survives serverless and isolates
// each judge — the seed vehicle/config stay static.
import { revalidatePath } from "next/cache";
import { seedVehicle } from "@/data/seed";
import { readSession, writeSession } from "@/lib/session";
import type { FuelGrade } from "@/domain/types";

const GRADES: FuelGrade[] = ["RON95", "RON97", "diesel"];

function refreshHero() {
  revalidatePath("/");
  revalidatePath("/tank");
  revalidatePath("/ask");
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Issue 02 — log a Fill. RON95 decrements the Quota Balance via quota-ledger. */
export async function logFill(input: {
  litres: number;
  ringgit: number;
  grade: FuelGrade;
  odometerKm: number;
}): Promise<ActionResult> {
  const litres = Number(input.litres);
  const ringgit = Number(input.ringgit);
  const odometerKm = Number(input.odometerKm);
  if (!(litres > 0)) return { ok: false, error: "Litres must be greater than 0." };
  if (!(ringgit >= 0)) return { ok: false, error: "Ringgit can't be negative." };
  if (!GRADES.includes(input.grade)) return { ok: false, error: "Unknown fuel grade." };
  if (!(odometerKm > 0)) return { ok: false, error: "Odometer must be greater than 0." };

  const s = await readSession();
  s.fills.push({
    id: crypto.randomUUID(),
    vehicleId: seedVehicle.id,
    litres,
    ringgit,
    grade: input.grade,
    odometerKm,
    at: new Date().toISOString(),
  });
  await writeSession(s);
  refreshHero();
  return { ok: true };
}

/** Issue 03 — re-anchor ("Correct balance") to a known remaining quota. */
export async function correctBalance(quotaLitres: number): Promise<ActionResult> {
  const litres = Number(quotaLitres);
  if (!(litres >= 0)) return { ok: false, error: "Enter your remaining litres." };
  const s = await readSession();
  s.anchor = { quotaLitres: litres, at: new Date().toISOString() };
  await writeSession(s);
  refreshHero();
  return { ok: true };
}
