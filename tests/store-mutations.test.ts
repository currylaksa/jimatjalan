import { describe, it, expect } from "vitest";
import { store } from "@/data/local-store";
import { computeQuotaBalance } from "@/domain/quota-ledger";
import type { FuelGrade } from "@/domain/types";

// The write seam behind issues 02 (log Fill) + 03 (re-anchor). Exercises the
// real store singleton + quota-ledger — the exact path the server actions drive.
const today = new Date("2026-06-14T12:00:00Z");
const balance = () =>
  computeQuotaBalance({
    anchor: store.getAnchor(),
    fills: store.listFills(),
    quotaCap: store.getQuotaConfig().quotaCap,
    prices: store.getQuotaConfig().prices,
    today,
  }).litresLeft;

const addFill = (litres: number, grade: FuelGrade, atIso: string) =>
  store.addFill({
    id: crypto.randomUUID(),
    vehicleId: store.getVehicle().id,
    litres,
    ringgit: litres * 2,
    grade,
    odometerKm: 46000,
    at: atIso,
  });

describe("store + ledger write seam (issues 02 + 03)", () => {
  it("starts from the seeded balance (anchor 24 − 12 L fill = 12 L)", () => {
    expect(balance()).toBe(12);
  });

  it("logging a RON95 fill decrements the Quota Balance (Wallet moves)", () => {
    addFill(4, "RON95", "2026-06-13T10:00:00Z");
    expect(balance()).toBe(8);
  });

  it("logging a RON97 fill does NOT change the Quota Balance", () => {
    addFill(5, "RON97", "2026-06-13T11:00:00Z");
    expect(balance()).toBe(8);
  });

  it("re-anchoring resets the balance to the corrected value", () => {
    store.setAnchor({ quotaLitres: 50, at: "2026-06-14T00:00:00Z" });
    expect(balance()).toBe(50); // prior fills are before the new anchor → ignored
  });

  it("subsequent RON95 fills decrement from the re-anchored value", () => {
    addFill(6, "RON95", "2026-06-14T06:00:00Z");
    expect(balance()).toBe(44);
  });
});
