"use client";

// Lightweight store for milestone narrator popups.
// Written by useSimulation (when thresholds are crossed),
// read by NarratorPopup alongside the simulation queue.

import { create } from "zustand";
import type { NarratorEvent } from "@/types/narrator";

interface MilestoneStore {
  events: NarratorEvent[];
  addEvent: (e: NarratorEvent) => void;
  dismissEvent: (id: string) => void;
}

export const useMilestoneStore = create<MilestoneStore>()((set) => ({
  events: [],
  addEvent: (e) => set((s) => ({ events: [...s.events, e].slice(-5) })),
  dismissEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
}));
