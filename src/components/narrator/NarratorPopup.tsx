"use client";

import { useEffect } from "react";
import { useNarrator } from "@/hooks/useNarrator";
import { useMilestoneStore } from "@/store/milestoneStore";
import { Badge } from "@/components/ui/Badge";
import type { NarratorEvent, NarratorSeverity } from "@/types/narrator";

const SEVERITY_VARIANT: Record<NarratorSeverity, "accent" | "default" | "loss"> = {
  info: "accent",
  warning: "default",
  critical: "loss",
};

const AUTO_DISMISS_MS = 4000;

export function NarratorPopup() {
  const { activePopups, dismissPopup } = useNarrator();
  const milestoneEvents = useMilestoneStore((s) => s.events);
  const dismissMilestone = useMilestoneStore((s) => s.dismissEvent);

  // Merge simulation + milestone popups; show latest 1
  const allPopups: NarratorEvent[] = [...activePopups, ...milestoneEvents];
  const visible = allPopups.slice(-1);

  // Auto-dismiss oldest simulation popup
  useEffect(() => {
    if (activePopups.length === 0) return;
    const oldest = activePopups[0];
    const timer = setTimeout(() => dismissPopup(oldest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [activePopups, dismissPopup]);

  // Auto-dismiss oldest milestone popup
  useEffect(() => {
    if (milestoneEvents.length === 0) return;
    const oldest = milestoneEvents[0];
    const timer = setTimeout(() => dismissMilestone(oldest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [milestoneEvents, dismissMilestone]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
      {visible.map((popup) => {
        const isMilestone = milestoneEvents.some((m) => m.id === popup.id);
        const dismiss = isMilestone
          ? () => dismissMilestone(popup.id)
          : () => dismissPopup(popup.id);
        return (
          <button
            key={popup.id}
            onClick={dismiss}
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
        );
      })}
    </div>
  );
}
