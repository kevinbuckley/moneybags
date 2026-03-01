"use client";

import type { Scenario } from "@/types/scenario";

const SCENARIO_EMOJI: Record<string, string> = {
  "2008-crisis": "🔴",
  "dotcom-bubble": "🔴",
  "black-monday": "🔴",
  "covid-crash": "🟡",
  "2021-bull-run": "🟢",
  "2022-crypto-winter": "🔴",
  "2023-ai-boom": "🟢",
  "dotcom-recovery": "🟢",
  "2022-rate-hike": "🔴",
  "the-future": "🔮",
  "tutorial": "🎓",
};

const SCENARIO_BADGE: Record<string, string> = {
  red: "text-loss bg-loss/10",
  green: "text-gain bg-gain/10",
  yellow: "text-yellow-400 bg-yellow-500/10",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: "text-gain bg-gain/10",
  Hard: "text-yellow-400 bg-yellow-500/10",
  Brutal: "text-loss bg-loss/10",
};

interface UpcomingListProps {
  upcoming: Array<{ date: string; scenario: Scenario }>;
}

function formatUpcomingDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function UpcomingList({ upcoming }: UpcomingListProps) {
  if (upcoming.length === 0) return null;

  return (
    <div className="px-4 pb-16 max-w-3xl mx-auto w-full">
      <p className="text-muted text-xs font-mono text-center mb-4 uppercase tracking-widest">
        📅 Upcoming Challenges
      </p>
      <div className="flex flex-col gap-2">
        {upcoming.map(({ date, scenario }) => (
          <div
            key={date}
            className="rounded-xl border border-border bg-elevated/50 p-4 flex items-center gap-4 opacity-70"
          >
            {/* Date */}
            <div className="shrink-0 text-center w-16">
              <p className="text-muted text-xs font-mono leading-tight">
                {formatUpcomingDate(date)}
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-border shrink-0" />

            {/* Scenario info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-sm">{SCENARIO_EMOJI[scenario.slug] ?? "⚪"}</span>
                <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded-full ${SCENARIO_BADGE[scenario.color]}`}>
                  {scenario.startDate.slice(0, 4)}–{scenario.endDate.slice(0, 4)}
                </span>
                <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded-full ${DIFFICULTY_BADGE[scenario.difficulty]}`}>
                  {scenario.difficulty}
                </span>
              </div>
              <p className="text-primary text-sm font-semibold truncate">{scenario.name}</p>
            </div>

            {/* Lock icon */}
            <span className="text-muted text-base shrink-0">🔒</span>
          </div>
        ))}
      </div>
    </div>
  );
}
