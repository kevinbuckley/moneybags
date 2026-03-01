"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DailyChallengeState {
  /** The UTC date (YYYY-MM-DD) when the user first started a challenge */
  lockedDate: string | null;
  /** The scenario slug they committed to on lockedDate */
  lockedSlug: string | null;

  /** Call this when the simulation launches */
  recordPlay: (date: string, slug: string) => void;
}

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set) => ({
      lockedDate: null,
      lockedSlug: null,
      recordPlay: (date, slug) => set({ lockedDate: date, lockedSlug: slug }),
    }),
    { name: "moneybags-daily-v1" }
  )
);
