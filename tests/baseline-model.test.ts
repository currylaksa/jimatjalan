import { describe, it, expect } from "vitest";
import { resolveBaseline } from "@/domain/baseline-model";
import type { Fill } from "@/domain/types";

const fill = (over: Partial<Fill>): Fill => ({
  id: "f", vehicleId: "v", litres: 10, ringgit: 0, grade: "RON95",
  odometerKm: 0, at: "2026-06-01T00:00:00Z", ...over,
});

describe("resolveBaseline — hybrid spec→personal (CONTEXT.md Baseline)", () => {
  it("uses the make/model spec when there are no fills to learn from", () => {
    expect(resolveBaseline({ makeModelSpecL100: 6.4, personalFills: [] })).toBe(6.4);
  });

  it("stays on the spec with only one interval (too little to personalise — no false flag)", () => {
    const b = resolveBaseline({
      makeModelSpecL100: 6.4,
      personalFills: [
        fill({ odometerKm: 0, at: "2026-06-01T00:00:00Z" }),
        fill({ litres: 12, odometerKm: 160, at: "2026-06-10T00:00:00Z" }),
      ],
    });
    expect(b).toBe(6.4);
  });

  it("migrates toward the personal rolling average as intervals accumulate", () => {
    const spec = 6.0;
    const b = resolveBaseline({
      makeModelSpecL100: spec,
      personalFills: [
        fill({ odometerKm: 0, at: "2026-06-01T00:00:00Z" }),
        fill({ litres: 8, odometerKm: 100, at: "2026-06-05T00:00:00Z" }), // 8.0 L/100km
        fill({ litres: 8, odometerKm: 200, at: "2026-06-09T00:00:00Z" }), // 8.0 L/100km
      ],
    });
    expect(b).toBeGreaterThan(spec);
    expect(b).toBeLessThan(8.0);
  });
});
