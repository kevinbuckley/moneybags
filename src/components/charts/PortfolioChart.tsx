"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { PortfolioSnapshot } from "@/types/portfolio";
import type { ScenarioEvent } from "@/types/scenario";
import { formatCurrency, formatDate } from "@/lib/format";

interface PortfolioChartProps {
  history: PortfolioSnapshot[];
  events?: ScenarioEvent[];
  height?: number;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const pct = payload[0]?.payload?.cumulativeReturn as number | undefined;
  return (
    <div className="bg-elevated border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-secondary mb-1">{formatDate(label as string, true)}</p>
      <p className="text-primary font-mono font-semibold">{formatCurrency(val)}</p>
      {pct !== undefined && (
        <p className={`font-mono text-xs ${pct >= 0 ? "text-gain" : "text-loss"}`}>
          {pct >= 0 ? "+" : ""}{(pct * 100).toFixed(1)}% total
        </p>
      )}
    </div>
  );
}

export function PortfolioChart({ history, events = [], height = 240 }: PortfolioChartProps) {
  if (history.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted text-xs"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-gain)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-gain)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--color-secondary)", fontSize: 10 }}
          tickFormatter={(d: string) => formatDate(d, true)}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrency(v, true)}
          tick={{ fill: "var(--color-secondary)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
        {events.map((evt) => (
          <ReferenceLine
            key={evt.date}
            x={evt.date}
            stroke="var(--color-accent)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: evt.label,
              fill: "var(--color-accent)",
              fontSize: 9,
              position: "insideTopRight",
            }}
          />
        ))}
        <Area
          type="monotone"
          dataKey="totalValue"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#portfolioGradient)"
          dot={false}
          activeDot={{ r: 3, fill: "var(--color-accent)", stroke: "var(--color-elevated)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
