"use client";

import { useEffect } from "react";
import { useNarrator } from "@/hooks/useNarrator";
import { Badge } from "@/components/ui/Badge";
import type { NarratorSeverity } from "@/types/narrator";

const SEVERITY_VARIANT: Record<NarratorSeverity, "accent" | "default" | "loss"> = {
  info: "accent",
  warning: "default",
  critical: "loss",
};

const AUTO_DISMISS_MS = 4000;

export function NarratorPopup() {
  const { activePopups, dismissPopup } = useNarrator();

  // Auto-dismiss the oldest visible popup whenever the list changes
  useEffect(() => {
    if (activePopups.length === 0) return;
    const oldest = activePopups[0];
    const timer = setTimeout(() => dismissPopup(oldest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [activePopups, dismissPopup]);

  if (activePopups.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
      {activePopups.slice(-1).map((popup) => (
        <button
          key={popup.id}
          onClick={() => dismissPopup(popup.id)}
          className="bg-elevated border border-border rounded-xl px-4 py-3 shadow-xl text-left w-full hover:border-accent/50 transition-colors"
        >
          <div className="flex items-start gap-2">
            <Badge variant={SEVERITY_VARIANT[popup.severity]} className="mt-0.5 shrink-0">
              {popup.severity}
            </Badge>
            <p className="text-primary text-xs leading-relaxed">{popup.message}</p>
          </div>
          <p className="text-muted text-xs mt-1 font-mono">{popup.timestamp}</p>
        </button>
      ))}
    </div>
  );
}
