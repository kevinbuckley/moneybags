"use client";

import Link from "next/link";
import { useDailyChallengeStore } from "@/store/dailyChallengeStore";
import { getTodayString } from "@/lib/dailyChallenge";
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

interface DailyChallengeCardProps {
  todayScenario: Scenario;
}

export function DailyChallengeCard({ todayScenario }: DailyChallengeCardProps) {
  const { lockedDate, lockedSlug } = useDailyChallengeStore();
  const today = getTodayString();
  const isPlayingToday = lockedDate === today;
  const isLockedToThisScenario = isPlayingToday && lockedSlug === todayScenario.slug;

  const href = `/setup?s=${todayScenario.slug}&daily=1`;

  return (
    <div className="px-4 pb-8 max-w-3xl mx-auto w-full">
      <p className="text-muted text-xs font-mono text-center mb-4 uppercase tracking-widest">
        🎯 Today&apos;s Challenge
      </p>
      <Link
        href={href}
        className="block rounded-2xl border border-accent/50 bg-accent/5 ring-1 ring-accent/30 p-6 transition-all hover:bg-accent/10 hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-2xl">{SCENARIO_EMOJI[todayScenario.slug] ?? "⚪"}</span>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${SCENARIO_BADGE[todayScenario.color]}`}>
                {todayScenario.startDate.slice(0, 4)}–{todayScenario.endDate.slice(0, 4)}
              </span>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[todayScenario.difficulty]}`}>
                {todayScenario.difficulty}
              </span>
            </div>
            <h2 className="text-primary font-bold text-xl mb-1">{todayScenario.name}</h2>
            <p className="text-secondary text-sm italic mb-4">{todayScenario.snarkDescription}</p>

            {isLockedToThisScenario ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-gain/20 text-gain border border-gain/30 font-semibold rounded-lg px-4 py-2 text-sm">
                  ✓ Playing today — Replay →
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold rounded-lg px-4 py-2 text-sm">
                Play Today&apos;s Challenge →
              </span>
            )}
          </div>
        </div>
      </Link>

      {isLockedToThisScenario && (
        <p className="text-center text-xs text-muted mt-3 font-mono">
          🔒 Come back tomorrow for a new challenge
        </p>
      )}
    </div>
  );
}
