"use client";

import { useEffect, useRef, useState } from "react";

const PUB_ID = "ca-pub-2954508563135581";
const SLOT_ID = "4359398745";

interface AdInterstitialProps {
  onDismiss: () => void;
}

export function AdInterstitial({ onDismiss }: AdInterstitialProps) {
  const [adFailed, setAdFailed] = useState(false);
  const insRef = useRef<HTMLModElement>(null);
  const isDev = process.env.NODE_ENV === "development";

  // Push the ad unit once on mount
  useEffect(() => {
    if (isDev) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ad blocked or not loaded
    }
  }, [isDev]);

  // Detect whether the <ins> element filled — if still 0px tall after 2s, show fallback
  useEffect(() => {
    if (isDev) return;
    const timer = setTimeout(() => {
      const el = insRef.current;
      if (!el || el.clientHeight < 2) {
        setAdFailed(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isDev]);

  return (
    <div className="fixed inset-0 z-50 bg-base flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs text-muted">Advertisement</span>
        <button
          onClick={onDismiss}
          className="text-sm font-semibold px-3 py-1 rounded-lg bg-accent text-white"
        >
          Start Simulation →
        </button>
      </div>

      {/* Ad */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {isDev ? (
          <div className="w-full max-w-md h-64 border border-dashed border-border rounded-xl flex items-center justify-center">
            <span className="text-xs text-muted">Full-page ad ({SLOT_ID})</span>
          </div>
        ) : adFailed ? (
          /* Fallback when ad doesn't load (ad blocker, not yet approved, etc.) */
          <div className="w-full max-w-md text-center py-12 px-6">
            <p className="text-4xl mb-4">💰</p>
            <p className="text-primary font-semibold text-lg mb-2">Mr. Moneybags</p>
            <p className="text-secondary text-sm leading-relaxed">
              Simulate real market crashes with fake money. No losses. No lessons learned. Pure chaos.
            </p>
          </div>
        ) : (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%", maxWidth: 480, minHeight: 280 }}
            data-ad-client={PUB_ID}
            data-ad-slot={SLOT_ID}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  );
}
