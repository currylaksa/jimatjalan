import { describe, it, expect } from "vitest";
import { ecoTips } from "@/domain/eco-tips";

describe("ecoTips — practical fuel/emissions advice, keyed to detected causes", () => {
  it("returns a tip per detected cause (code-owned, never free-styled)", () => {
    const tips = ecoTips(["idling", "hard acceleration"]);
    expect(tips).toHaveLength(2);
    expect(tips[0]).toHaveProperty("title");
    expect(tips[0]).toHaveProperty("body");
    expect(tips.map((t) => t.cause)).toEqual(["idling", "hard acceleration"]);
  });

  it("caps at 3 tips", () => {
    expect(ecoTips(["idling", "hard acceleration", "tyre pressure", "AC load", "cargo"]).length).toBe(3);
  });

  it("returns nothing when efficient (no causes)", () => {
    expect(ecoTips([])).toEqual([]);
  });

  it("ignores unknown causes", () => {
    expect(ecoTips(["teleportation"])).toEqual([]);
  });
});
