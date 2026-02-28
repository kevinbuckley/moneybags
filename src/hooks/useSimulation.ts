"use client";

import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { useMilestoneStore } from "@/store/milestoneStore";
import { generateMilestoneEvent } from "@/lib/narrator";

const SPEED_INTERVALS: Record<number, number> = {
  1: 500,
  5: 100,
  10: 50,
};

// Portfolio return thresholds that trigger milestone narrator popups
const MILESTONES: { key: string; threshold: number; dir: "up" | "down" }[] = [
  { key: "+10", threshold: 0.10, dir: "up" },
  { key: "+25", threshold: 0.25, dir: "up" },
  { key: "+50", threshold: 0.50, dir: "up" },
  { key: "-20", threshold: -0.20, dir: "down" },
  { key: "-50", threshold: -0.50, dir: "down" },
];

/**
 * Manages simulation playback loop.
 * Drives the tick interval in movie mode.
 * Also fires milestone narrator popups when portfolio crosses thresholds.
 */
export function useSimulation() {
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const speed = useSimulationStore((s) => s.speed);
  const mode = useSimulationStore((s) => s.mode);
  const tick = useSimulationStore((s) => s.tick);
  const pause = useSimulationStore((s) => s.pause);
  const isComplete = useSimulationStore((s) => s.state?.isComplete ?? false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedMilestones = useRef<Set<string>>(new Set());
  const addMilestone = useMilestoneStore((s) => s.addEvent);

  useEffect(() => {
    if (mode !== "movie" || !isPlaying) return;

    const ms = SPEED_INTERVALS[speed] ?? 500;
    intervalRef.current = setInterval(() => {
      tick();

      // Check milestone thresholds after each tick
      const state = useSimulationStore.getState().state;
      if (!state) return;
      const { totalValue, startingValue } = state.portfolio;
      if (startingValue <= 0) return;
      const returnPct = (totalValue - startingValue) / startingValue;

      for (const m of MILESTONES) {
        if (firedMilestones.current.has(m.key)) continue;
        const crossed =
          m.dir === "up" ? returnPct >= m.threshold : returnPct <= m.threshold;
        if (crossed) {
          firedMilestones.current.add(m.key);
          addMilestone(generateMilestoneEvent(m.threshold));
        }
      }
    }, ms);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, mode, addMilestone]); // tick is a stable Zustand action

  // Reset fired milestones when simulation resets (isComplete goes false)
  useEffect(() => {
    if (!isComplete) {
      firedMilestones.current = new Set();
    }
  }, [isComplete]);

  // Auto-pause when simulation completes
  useEffect(() => {
    if (isComplete && isPlaying) {
      pause();
    }
  }, [isComplete, isPlaying, pause]);

  return useSimulationStore();
}
