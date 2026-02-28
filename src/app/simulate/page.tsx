"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/hooks/useSimulation";
import { useSimulationStore } from "@/store/simulationStore";
import { PortfolioChart } from "@/components/charts/PortfolioChart";
import { NarratorPopup } from "@/components/narrator/NarratorPopup";
import { PlaybackControls } from "@/components/simulation/PlaybackControls";
import { PortfolioPanel } from "@/components/simulation/PortfolioPanel";
import { AdInterstitial } from "@/components/ads/AdInterstitial";

export default function SimulatePage() {
  const router = useRouter();
  useSimulation(); // drives the playback interval

  const state = useSimulationStore((s) => s.state);
  const play = useSimulationStore((s) => s.play);
  const hasAutoStarted = useRef(false);
  const [adDismissed, setAdDismissed] = useState(false);

  // Auto-start only after ad is dismissed
  useEffect(() => {
    if (state && adDismissed && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      play();
    }
  }, [state, adDismissed, play]);

  // Redirect to results 1.5s after simulation completes
  useEffect(() => {
    if (state?.isComplete) {
      const t = setTimeout(() => router.push("/results"), 1500);
      return () => clearTimeout(t);
    }
  }, [state?.isComplete, router]);

  // Guard: redirect to setup if no state (direct navigation or page refresh)
  useEffect(() => {
    if (state === null) {
      router.push("/setup");
    }
  }, [state, router]);

  const history = state?.history ?? [];
  const events = state?.config.scenario.events ?? [];

  return (
    <main className="h-dvh flex flex-col overflow-hidden">
      {/* Full-page ad shown before simulation starts */}
      {!adDismissed && <AdInterstitial onDismiss={() => setAdDismissed(true)} />}

      {/* Portfolio header */}
      <PortfolioPanel />

      {/* Chart */}
      <div className="flex-1 min-h-0 flex flex-col justify-center px-2 py-2">
        <PortfolioChart history={history} events={events} height={220} />
      </div>

      {/* Completion banner */}
      {state?.isComplete && (
        <div className="bg-accent/10 border-t border-accent/30 px-4 py-2 text-center">
          <p className="text-accent text-sm font-semibold">
            Simulation complete — heading to results...
          </p>
        </div>
      )}

      {/* Playback controls */}
      <PlaybackControls />

      {/* Narrator popups (fixed top-right, non-blocking) */}
      <NarratorPopup />
    </main>
  );
}
