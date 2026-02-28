"use client";

import type { SimulationAnalytics } from "@/types/analytics";

interface AnalyticsGridProps {
  analytics: SimulationAnalytics;
}

interface MetricCard {
  label: string;
  value: string;
  description: string;
  color: "gain" | "loss" | "neutral" | "auto";
}

function colorClass(color: MetricCard["color"], value: number): string {
  if (color === "gain") return "text-gain";
  if (color === "loss") return "text-loss";
  if (color === "neutral") return "text-secondary";
  // auto: positive = gain, negative = loss
  return value >= 0 ? "text-gain" : "text-loss";
}

export function AnalyticsGrid({ analytics }: AnalyticsGridProps) {
  const cards: MetricCard[] = [
    {
      label: "Sharpe Ratio",
      value: analytics.sharpeRatio.toFixed(2),
      description: "Risk-adjusted return vs risk-free rate",
      color: "auto",
    },
    {
      label: "Max Drawdown",
      value: `${analytics.maxDrawdownPct.toFixed(1)}%`,
      description: "Largest peak-to-trough decline",
      color: "loss",
    },
    {
      label: "Annualized Volatility",
      value: `${(analytics.annualizedVolatility * 100).toFixed(1)}%`,
      description: "Annualized standard deviation of returns",
      color: "neutral",
    },
    {
      label: "Beta vs S&P 500",
      value: analytics.beta.toFixed(2),
      description: "Portfolio sensitivity to market moves",
      color: "neutral",
    },
  ];

  const numericValues = [
    analytics.sharpeRatio,
    analytics.maxDrawdownPct,
    analytics.annualizedVolatility,
    analytics.beta,
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="bg-elevated border border-border rounded-xl p-4"
        >
          <p className="text-muted text-xs mb-1">{card.label}</p>
          <p className={`text-2xl font-bold font-mono ${colorClass(card.color, numericValues[i]!)}`}>
            {card.value}
          </p>
          <p className="text-muted text-xs mt-1 leading-snug">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
