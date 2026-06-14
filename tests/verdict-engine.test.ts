import { describe, it, expect } from "vitest";
import { decideVerdict } from "@/domain/verdict-engine";
import type { VerdictScenario } from "@/domain/verdict-engine";
import type { Prices } from "@/domain/types";

const prices: Prices = { subsidised: 1.99, ron95Market: 4.07, ron97: 4.85, diesel: 4.97 };
const config = { reserveDays: 2 };

// Scenarios mirror the validated prototype presets (.scratch/.../verdict-engine).
const scenario = (over: Partial<VerdictScenario>): VerdictScenario => ({
  gradeConsidering: "RON95",
  eligible: true,
  quotaCap: 200,
  quotaLitresLeft: 12,
  dailyBurn: 2,
  tankLevelLitres: 0,
  tankCapacityLitres: 40,
  daysToSubsidyReset: 6,
  daysToFloatReset: 2,
  prices,
  config,
  ...over,
});

describe("decideVerdict — subsidy regime", () => {
  it("locks the RM58 hero case: quota 12, burn 2, reset 6, empty 40L tank → bridge 12L, save RM58.24", () => {
    const d = decideVerdict(scenario({}));
    expect(d.regime).toBe("subsidy");
    expect(d.resetClock).toBe("month");
    expect(d.action).toBe("bridge");
    expect(d.recommendLitresNow).toBe(12);
    expect(d.ringgitNow).toBeCloseTo(23.88, 2);
    expect(d.ringgitSaved).toBeCloseTo(58.24, 2);
    expect(d.reasonCode).toBe("BRIDGE_RIDE_TO_RESET");
  });

  it("waits when the tank is fine and subsidy is plentiful", () => {
    const d = decideVerdict(
      scenario({ quotaLitresLeft: 150, dailyBurn: 8, tankLevelLitres: 25, daysToSubsidyReset: 20 }),
    );
    expect(d.action).toBe("wait");
    expect(d.recommendLitresNow).toBe(0);
    expect(d.ringgitNow).toBe(0);
    expect(d.reasonCode).toBe("TANK_FINE_RIDE_SUBSIDY");
  });

  it("banks expiring subsidy when subsidy-constrained with a surplus (tank not low)", () => {
    const d = decideVerdict(
      scenario({
        quotaLitresLeft: 60,
        dailyBurn: 9,
        tankLevelLitres: 20,
        tankCapacityLitres: 45,
        daysToSubsidyReset: 2,
      }),
    );
    expect(d.action).toBe("bank");
    expect(d.recommendLitresNow).toBe(25); // min(tankSpace 25, surplus 42)
    expect(d.ringgitNow).toBeCloseTo(49.75, 2);
    expect(d.ringgitSaved).toBeCloseTo(52.0, 2);
    expect(d.reasonCode).toBe("BANK_EXPIRING_SUBSIDY");
  });

  it("fills when the quota cannot bridge to the reset (no saving available)", () => {
    const d = decideVerdict(
      scenario({ quotaLitresLeft: 5, dailyBurn: 8, tankLevelLitres: 0, daysToSubsidyReset: 6 }),
    );
    expect(d.action).toBe("fill");
    expect(d.recommendLitresNow).toBe(40); // capped at tank space
    expect(d.ringgitSaved).toBe(0);
    expect(d.reasonCode).toBe("FILL_NEEDED_NOW");
  });

  it("minimises market litres before the reset (bridge, but quota can't fully cover survival)", () => {
    const d = decideVerdict(
      scenario({ quotaLitresLeft: 20, dailyBurn: 4, tankLevelLitres: 0, daysToSubsidyReset: 6 }),
    );
    expect(d.action).toBe("bridge");
    expect(d.recommendLitresNow).toBe(24);
    expect(d.subsidisedNow).toBe(20);
    expect(d.marketNow).toBe(4);
    expect(d.ringgitSaved).toBeCloseTo(33.28, 2);
    expect(d.reasonCode).toBe("MINIMISE_MARKET_BEFORE_RESET");
  });

  it("never claims carbon on the verdict", () => {
    const d = decideVerdict(scenario({}));
    expect(d.carbonClaimable).toBe(false);
  });
});

describe("decideVerdict — float regime (ADR-0001: no saving claim)", () => {
  it("runs RON97 against the Wednesday clock and bridges with NO saving", () => {
    const d = decideVerdict(scenario({ gradeConsidering: "RON97", tankLevelLitres: 0 }));
    expect(d.regime).toBe("float");
    expect(d.resetClock).toBe("week");
    expect(d.daysToReset).toBe(2); // daysToFloatReset
    expect(d.action).toBe("bridge");
    expect(d.ringgitSaved).toBeNull();
    expect(d.reasonCode).toBe("FLOAT_BRIDGE_TO_REPRICE");
  });

  it("treats diesel as float", () => {
    const d = decideVerdict(scenario({ gradeConsidering: "diesel", tankLevelLitres: 0 }));
    expect(d.regime).toBe("float");
    expect(d.ringgitSaved).toBeNull();
  });

  it("treats over-quota RON95 (no litres left) as float", () => {
    const d = decideVerdict(scenario({ quotaLitresLeft: 0, tankLevelLitres: 0 }));
    expect(d.regime).toBe("float");
    expect(d.resetClock).toBe("week");
  });

  it("treats ineligible RON95 as float", () => {
    const d = decideVerdict(scenario({ eligible: false, tankLevelLitres: 0 }));
    expect(d.regime).toBe("float");
  });

  it("returns ringgitSaved === null even when the float tank is fine (wait)", () => {
    const d = decideVerdict(scenario({ gradeConsidering: "RON97", tankLevelLitres: 25 }));
    expect(d.action).toBe("wait");
    expect(d.reasonCode).toBe("FLOAT_TANK_FINE");
    expect(d.ringgitSaved).toBeNull();
  });

  it("flips regime back to subsidy when the considered grade is eligible RON95", () => {
    const float = decideVerdict(scenario({ gradeConsidering: "RON97" }));
    const subsidy = decideVerdict(scenario({ gradeConsidering: "RON95" }));
    expect(float.regime).toBe("float");
    expect(subsidy.regime).toBe("subsidy");
  });
});
