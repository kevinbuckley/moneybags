// Tests for src/lib/dailyChallenge.ts

import { describe, it, expect } from "vitest";
import {
  getDailyScenario,
  getUpcomingChallenges,
  addDays,
  getTodayString,
} from "../dailyChallenge";
import type { Scenario } from "@/types/scenario";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeScenario(slug: string): Scenario {
  return {
    slug,
    name: slug,
    startDate: "2020-01-01",
    endDate: "2021-01-01",
    description: "",
    snarkDescription: "",
    color: "red",
    difficulty: "Hard",
    riskFreeRate: 0.02,
    events: [],
  };
}

const SCENARIOS_11 = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
].map(makeScenario);

const SCENARIOS_3 = ["alpha", "beta", "gamma"].map(makeScenario);

// ── getDailyScenario ──────────────────────────────────────────────────────────

describe("getDailyScenario", () => {
  it("returns the same scenario for the same date (deterministic)", () => {
    const a = getDailyScenario("2026-03-01", SCENARIOS_11);
    const b = getDailyScenario("2026-03-01", SCENARIOS_11);
    expect(a.slug).toBe(b.slug);
  });

  it("returns different scenarios for different dates (most days differ)", () => {
    // Over 7 consecutive days, we expect at least some variation
    const slugs = new Set(
      ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04",
       "2026-03-05", "2026-03-06", "2026-03-07"]
        .map((d) => getDailyScenario(d, SCENARIOS_11).slug)
    );
    // Not all 7 days should land on the same scenario with 11 choices
    expect(slugs.size).toBeGreaterThan(1);
  });

  it("always returns an in-bounds scenario", () => {
    const slugSet = new Set(SCENARIOS_11.map((s) => s.slug));
    for (let day = 1; day <= 365; day++) {
      const dateStr = addDays("2026-01-01", day - 1);
      const result = getDailyScenario(dateStr, SCENARIOS_11);
      expect(slugSet.has(result.slug)).toBe(true);
    }
  });

  it("visits every scenario at least once over 200 days", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const dateStr = addDays("2026-01-01", i);
      seen.add(getDailyScenario(dateStr, SCENARIOS_11).slug);
    }
    for (const s of SCENARIOS_11) {
      expect(seen.has(s.slug)).toBe(true);
    }
  });

  it("throws when the scenarios array is empty", () => {
    expect(() => getDailyScenario("2026-03-01", [])).toThrow("No scenarios available");
  });

  it("always returns the only scenario when array has length 1", () => {
    const single = [makeScenario("solo")];
    for (let i = 0; i < 30; i++) {
      const dateStr = addDays("2026-01-01", i);
      expect(getDailyScenario(dateStr, single).slug).toBe("solo");
    }
  });

  it("returns the same scenario regardless of array reference identity", () => {
    const copy = SCENARIOS_3.map((s) => ({ ...s }));
    const date = "2026-06-15";
    expect(getDailyScenario(date, SCENARIOS_3).slug).toBe(
      getDailyScenario(date, copy).slug
    );
  });
});

// ── getUpcomingChallenges ──────────────────────────────────────────────────────

describe("getUpcomingChallenges", () => {
  it("returns exactly `days` entries", () => {
    const results = getUpcomingChallenges("2026-03-02", 7, SCENARIOS_11);
    expect(results).toHaveLength(7);
  });

  it("returns an empty array when days=0", () => {
    const results = getUpcomingChallenges("2026-03-02", 0, SCENARIOS_11);
    expect(results).toHaveLength(0);
  });

  it("first entry date matches the fromDateStr", () => {
    const results = getUpcomingChallenges("2026-03-02", 3, SCENARIOS_11);
    expect(results[0].date).toBe("2026-03-02");
  });

  it("dates are strictly sequential (each +1 calendar day)", () => {
    const results = getUpcomingChallenges("2026-03-01", 10, SCENARIOS_11);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].date).toBe(addDays(results[i - 1].date, 1));
    }
  });

  it("each entry's scenario matches getDailyScenario for that date", () => {
    const results = getUpcomingChallenges("2026-03-01", 7, SCENARIOS_11);
    for (const { date, scenario } of results) {
      expect(scenario.slug).toBe(getDailyScenario(date, SCENARIOS_11).slug);
    }
  });

  it("crosses month boundaries correctly (Jan → Feb)", () => {
    const results = getUpcomingChallenges("2026-01-30", 5, SCENARIOS_11);
    expect(results[0].date).toBe("2026-01-30");
    expect(results[1].date).toBe("2026-01-31");
    expect(results[2].date).toBe("2026-02-01");
    expect(results[3].date).toBe("2026-02-02");
    expect(results[4].date).toBe("2026-02-03");
  });

  it("crosses year boundary correctly (Dec → Jan)", () => {
    const results = getUpcomingChallenges("2026-12-30", 4, SCENARIOS_11);
    expect(results[0].date).toBe("2026-12-30");
    expect(results[1].date).toBe("2026-12-31");
    expect(results[2].date).toBe("2027-01-01");
    expect(results[3].date).toBe("2027-01-02");
  });

  it("all returned scenarios are from the provided array", () => {
    const slugSet = new Set(SCENARIOS_3.map((s) => s.slug));
    const results = getUpcomingChallenges("2026-03-01", 30, SCENARIOS_3);
    for (const { scenario } of results) {
      expect(slugSet.has(scenario.slug)).toBe(true);
    }
  });
});

// ── addDays ───────────────────────────────────────────────────────────────────

describe("addDays", () => {
  it("adds 1 day to a basic date", () => {
    expect(addDays("2026-03-01", 1)).toBe("2026-03-02");
  });

  it("adds 0 days (no change)", () => {
    expect(addDays("2026-03-15", 0)).toBe("2026-03-15");
  });

  it("adds multiple days", () => {
    expect(addDays("2026-03-01", 10)).toBe("2026-03-11");
  });

  it("crosses end of March (30 → 31 → Apr 1)", () => {
    expect(addDays("2026-03-30", 1)).toBe("2026-03-31");
    expect(addDays("2026-03-31", 1)).toBe("2026-04-01");
  });

  it("crosses end of January correctly", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("handles non-leap year Feb correctly (Feb 28 → Mar 1)", () => {
    // 2026 is not a leap year
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("handles leap year Feb 28 → Feb 29", () => {
    // 2024 is a leap year
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("handles leap year Feb 29 → Mar 1", () => {
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
  });

  it("crosses year boundary (Dec 31 → Jan 1)", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("subtracts days with negative n", () => {
    expect(addDays("2026-03-05", -1)).toBe("2026-03-04");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("returns a YYYY-MM-DD formatted string", () => {
    const result = addDays("2026-06-15", 5);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── getTodayString ────────────────────────────────────────────────────────────

describe("getTodayString", () => {
  it("returns a string matching YYYY-MM-DD format", () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches new Date().toISOString().slice(0,10)", () => {
    // Both use the same UTC-based calculation, so they must agree
    const fromFn = getTodayString();
    const direct = new Date().toISOString().slice(0, 10);
    expect(fromFn).toBe(direct);
  });

  it("year is plausible (2025–2030 for near-future tests)", () => {
    const year = parseInt(getTodayString().slice(0, 4), 10);
    expect(year).toBeGreaterThanOrEqual(2025);
    expect(year).toBeLessThanOrEqual(2030);
  });
});
