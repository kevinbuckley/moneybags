// Layer 1: lib — daily challenge helpers (pure, no React/Zustand)

import type { Scenario } from "@/types/scenario";

// ── Seeded deterministic RNG (LCG) ───────────────────────────────────────────

/** Convert "YYYY-MM-DD" string to a numeric seed */
function dateSeed(dateStr: string): number {
  // e.g. "2026-03-02" → 20260302
  return parseInt(dateStr.replace(/-/g, ""), 10);
}

/** LCG-based seeded random → value in [0, 1) */
function seededRandom(seed: number): number {
  // Same LCG parameters used in generate-future.mjs for consistency
  let s = seed | 0;
  s = Math.imul(s, 1664525) + 1013904223;
  return (s >>> 0) / 0x100000000;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Today's date as "YYYY-MM-DD" in UTC (same for all users regardless of timezone) */
export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Deterministically pick today's scenario based on the given date string.
 * Same date → same scenario for every user everywhere.
 */
export function getDailyScenario(dateStr: string, scenarios: Scenario[]): Scenario {
  if (scenarios.length === 0) throw new Error("No scenarios available");
  const idx = Math.floor(seededRandom(dateSeed(dateStr)) * scenarios.length);
  return scenarios[idx];
}

/**
 * Return `days` upcoming daily challenges starting from `fromDateStr`.
 * Pass tomorrow's date as `fromDateStr` to get the next N days.
 */
export function getUpcomingChallenges(
  fromDateStr: string,
  days: number,
  scenarios: Scenario[]
): Array<{ date: string; scenario: Scenario }> {
  const result: Array<{ date: string; scenario: Scenario }> = [];
  const d = new Date(fromDateStr + "T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, scenario: getDailyScenario(dateStr, scenarios) });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return result;
}

/** Add one calendar day to a "YYYY-MM-DD" string */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
