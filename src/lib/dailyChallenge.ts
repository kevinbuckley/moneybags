// Layer 1: lib — daily challenge helpers (pure, no React/Zustand)

import type { Scenario } from "@/types/scenario";

// ── Seeded deterministic RNG (LCG) ───────────────────────────────────────────

/** Convert "YYYY-MM-DD" string to a numeric seed */
function dateSeed(dateStr: string): number {
  // e.g. "2026-03-02" → 20260302
  return parseInt(dateStr.replace(/-/g, ""), 10);
}

/** Seeded hash → value in [0, 1) with good avalanche for sequential inputs */
function seededRandom(seed: number): number {
  // SplitMix32 finalizer — thoroughly mixes bits so consecutive date seeds
  // (which differ by only 1) produce well-distributed, uncorrelated outputs.
  let s = seed | 0;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) | 0;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) | 0;
  s = s ^ (s >>> 16);
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

/**
 * Returns `true` when the user's existing daily lock should block them from
 * starting a *different* scenario today.
 *
 * Returns `false` (i.e. allow play) when any of these hold:
 *  - They haven't played today (`lockedDate !== today`)
 *  - They have no lock (`lockedSlug` is null)
 *  - The locked slug no longer exists in the current scenarios — the scenario
 *    was removed from the app after the user played it, so the lock is stale
 *    and we should not punish them
 *  - They are replaying the exact same scenario they already locked to
 */
export function isDailyLockConflict(
  lockedDate: string | null,
  lockedSlug: string | null,
  today: string,
  targetSlug: string,
  scenarios: Scenario[]
): boolean {
  if (lockedDate !== today) return false;
  if (!lockedSlug) return false;
  // Stale lock: the scenario that was played no longer exists in the current
  // scenario list (e.g. it was removed between the user's session and now).
  if (!scenarios.some((s) => s.slug === lockedSlug)) return false;
  return lockedSlug !== targetSlug;
}

/** Add one calendar day to a "YYYY-MM-DD" string */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
