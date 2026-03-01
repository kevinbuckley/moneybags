import Link from "next/link";
import type { Metadata } from "next";
import { SCENARIOS } from "@/data/scenarios";
import { StreakBadge } from "@/components/landing/StreakBadge";
import { PersonalBestBadge } from "@/components/landing/PersonalBestBadge";
import { DailyChallengeCard } from "@/components/landing/DailyChallengeCard";
import { UpcomingList } from "@/components/landing/UpcomingList";
import { getDailyScenario, getUpcomingChallenges, getTodayString, addDays } from "@/lib/dailyChallenge";

export const metadata: Metadata = {
  title: "Mr. Moneybags — Invest Fake Money",
  description:
    "Simulate the 2008 crisis, dot-com bubble, Black Monday, and more with real historical data. Rules, auto-trading, and zero real money on the line.",
  openGraph: {
    title: "Mr. Moneybags — Invest Fake Money",
    description:
      "Simulate famous market crashes and bull runs with real data. Pick a scenario, build a portfolio, set trading rules, and see what happens.",
  },
};

export default function LandingPage() {
  const today = getTodayString();
  const todayScenario = getDailyScenario(today, SCENARIOS);
  const upcoming = getUpcomingChallenges(addDays(today, 1), 7, SCENARIOS);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight">
          Mr. Money<span className="text-accent">bags</span>
        </h1>
        <p className="text-xl md:text-2xl font-bold text-primary mb-4 max-w-lg">
          Hey Mr. Moneybags, I heard you have some money to invest and think you can beat the market.
        </p>
        <p className="text-secondary text-base max-w-md mb-2">
          Simulate famous market crashes and bull runs with real historical data.
          Rules, options, shorts. Try it here so you don&apos;t lose all your real money.
        </p>
        <p className="text-muted text-xs font-mono mb-8">
          One challenge per day · New scenario every morning · 100% fake money
        </p>
        {/* Client component — shows streak badge if earned */}
        <StreakBadge />
      </div>

      {/* Today's Challenge — client component reads lock state from store */}
      <DailyChallengeCard todayScenario={todayScenario} />

      {/* Upcoming 7 days */}
      <UpcomingList upcoming={upcoming} />

      {/* Personal bests — show all scenarios with best scores */}
      <div className="px-4 pb-8 max-w-3xl mx-auto w-full">
        <p className="text-muted text-xs font-mono text-center mb-4 uppercase tracking-widest">
          🏆 Your Best Plays
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SCENARIOS.map((scenario) => (
            <div
              key={scenario.slug}
              className="rounded-xl border border-border bg-elevated/30 p-3 flex flex-col gap-1"
            >
              <p className="text-primary text-xs font-semibold truncate">{scenario.name}</p>
              <PersonalBestBadge scenarioSlug={scenario.slug} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto px-4 py-6 text-center text-xs text-muted border-t border-border">
        <p>Mr. Moneybags is for entertainment and educational purposes only. Not financial advice. Not even close.</p>
        <div className="flex gap-4 justify-center mt-2">
          <Link href="/how-to-play" className="text-secondary hover:text-primary transition-colors">How to Play</Link>
          <Link href="/leaderboard" className="text-secondary hover:text-primary transition-colors">Leaderboard</Link>
        </div>
      </footer>
    </main>
  );
}
