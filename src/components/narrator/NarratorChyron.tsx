"use client";

import { useNarrator } from "@/hooks/useNarrator";

export function NarratorChyron() {
  const { chyronMessages } = useNarrator();

  // Always render so the hook initializes ambient messages
  const content =
    chyronMessages.length > 0
      ? chyronMessages.join("  ·  ")
      : "Markets open. Fake money on the line. May the odds be ever in your favor.";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-elevated border-t border-border overflow-hidden h-8 flex items-center">
      {/* Duplicate content for seamless marquee loop */}
      <p className="animate-marquee whitespace-nowrap text-xs text-secondary font-mono shrink-0">
        {content}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{content}
      </p>
    </div>
  );
}
