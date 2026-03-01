// Tests for src/engine/simulator.ts — advanceTick

import { describe, it, expect } from "vitest";
import { advanceTick } from "../simulator";
import { createPortfolio } from "../portfolio";
import type { SimulationState, SimulationConfig } from "@/types/simulation";
import type { PriceDataMap, PricePoint } from "@/types/instrument";
import type { Portfolio } from "@/types/portfolio";
import type { Scenario } from "@/types/scenario";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeScenario(slug = "test"): Scenario {
  return {
    slug,
    name: "Test",
    startDate: "2020-01-02",
    endDate: "2020-01-06",
    description: "",
    snarkDescription: "",
    color: "green",
    difficulty: "Easy",
    riskFreeRate: 0.02,
    events: [],
  };
}

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    startingCapital: 10_000,
    scenario: makeScenario(),
    allocations: [],
    rules: [],
    mode: "movie",
    granularity: "daily",
    ...overrides,
  };
}

function makeState(
  portfolio: Portfolio = createPortfolio(10_000),
  overrides: Partial<SimulationState> = {}
): SimulationState {
  return {
    config: makeConfig(),
    currentDateIndex: 0,
    portfolio,
    history: [],
    rulesLog: [],
    narratorQueue: [],
    pendingTrades: [],
    isComplete: false,
    ...overrides,
  };
}

/** Build a PriceDataMap with an arbitrary number of trading days. */
function makeSeriesMap(
  ticker: string,
  closes: number[],
  startDate = "2020-01-02"
): PriceDataMap {
  const series: PricePoint[] = closes.map((c, i) => {
    // Advance calendar days (simplified: no weekend skip needed for unit tests)
    const d = new Date(startDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      open: c,
      high: c * 1.01,
      low: c * 0.99,
      close: c,
      volume: 1_000_000,
    };
  });
  return new Map([[ticker, series]]);
}

/** Minimal 3-day price map for SPY: 100 → 110 → 120 */
function threeDayPrices(): PriceDataMap {
  return makeSeriesMap("SPY", [100, 110, 120]);
}

// ── Regression: empty priceData causes immediate isComplete ───────────────────
// This is the root cause of "the-future sim ends immediately" — when data files
// use a bare-array format the loader cannot parse, priceData ends up with all
// empty/undefined series, and advanceTick has no date to process.

describe("advanceTick — empty / missing priceData (regression)", () => {
  it("returns isComplete:true immediately when priceData map is empty", () => {
    const state = makeState();
    const next = advanceTick(state, new Map());
    expect(next.isComplete).toBe(true);
    expect(next.currentDateIndex).toBe(0); // unchanged — no tick was processed
    expect(next.history).toHaveLength(0);
  });

  it("returns isComplete:true when the ticker series is an empty array", () => {
    const state = makeState();
    const prices: PriceDataMap = new Map([["SPY", []]]);
    const next = advanceTick(state, prices);
    expect(next.isComplete).toBe(true);
  });

  it("returns isComplete:true when only unknown tickers are present (no price for held asset)", () => {
    // Scenario: portfolio holds SPY but priceData only has QQQ
    const state = makeState();
    const prices = makeSeriesMap("QQQ", [490]);
    // currentDateIndex=0 → getDateAtIndex returns QQQ[0].date which is valid
    // so this will actually NOT be isComplete immediately — it will complete after tick
    // The point is: prices with a valid series still runs normally
    const next = advanceTick(state, prices);
    expect(next.isComplete).toBe(true); // only 1 price point → next index (1) >= length (1)
  });
});

// ── Basic progression ─────────────────────────────────────────────────────────

describe("advanceTick — basic progression", () => {
  it("advances currentDateIndex by exactly 1 per tick", () => {
    const state = makeState();
    const prices = threeDayPrices();
    const s1 = advanceTick(state, prices);
    expect(s1.currentDateIndex).toBe(1);
    const s2 = advanceTick(s1, prices);
    expect(s2.currentDateIndex).toBe(2);
  });

  it("appends exactly one snapshot to history per tick", () => {
    const prices = threeDayPrices();
    let state = makeState();
    state = advanceTick(state, prices);
    expect(state.history).toHaveLength(1);
    state = advanceTick(state, prices);
    expect(state.history).toHaveLength(2);
    state = advanceTick(state, prices);
    expect(state.history).toHaveLength(3);
  });

  it("snapshot.date matches the date processed that tick", () => {
    const prices = threeDayPrices();
    const s1 = advanceTick(makeState(), prices);
    expect(s1.history[0].date).toBe("2020-01-02");
    const s2 = advanceTick(s1, prices);
    expect(s2.history[1].date).toBe("2020-01-03");
  });

  it("sets isComplete:false while there are remaining ticks", () => {
    const prices = threeDayPrices();
    const s1 = advanceTick(makeState(), prices);
    expect(s1.isComplete).toBe(false);
    const s2 = advanceTick(s1, prices);
    expect(s2.isComplete).toBe(false);
  });

  it("sets isComplete:true after the last price point is consumed", () => {
    const prices = threeDayPrices(); // 3 points
    let state = makeState();
    state = advanceTick(state, prices); // tick 0 → 1
    state = advanceTick(state, prices); // tick 1 → 2
    state = advanceTick(state, prices); // tick 2 → 3 (past end)
    expect(state.isComplete).toBe(true);
  });

  it("does not mutate the input state (pure function)", () => {
    const state = makeState();
    const prices = threeDayPrices();
    const before = JSON.stringify(state);
    advanceTick(state, prices);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("clears pendingTrades after they are applied", () => {
    const prices = threeDayPrices();
    const state = makeState(createPortfolio(10_000), {
      pendingTrades: [
        { ticker: "SPY", action: "buy", amount: 1_000, source: "manual" },
      ],
    });
    const next = advanceTick(state, prices);
    expect(next.pendingTrades).toHaveLength(0);
  });
});

// ── Single-day series edge case ────────────────────────────────────────────────

describe("advanceTick — single price point", () => {
  it("processes the tick and then marks isComplete on the same tick", () => {
    const prices = makeSeriesMap("SPY", [100]);
    const state = makeState();
    const next = advanceTick(state, prices);
    expect(next.history).toHaveLength(1);
    expect(next.isComplete).toBe(true);
    expect(next.history[0].date).toBe("2020-01-02");
  });
});

// ── Trade application ─────────────────────────────────────────────────────────

describe("advanceTick — trade application", () => {
  it("applies a pending buy order at open price", () => {
    const prices = makeSeriesMap("SPY", [100, 110]);
    const state = makeState(createPortfolio(10_000), {
      pendingTrades: [
        { ticker: "SPY", action: "buy", amount: 5_000, source: "manual" },
      ],
    });
    const next = advanceTick(state, prices);
    const pos = next.portfolio.positions.find((p) => p.ticker === "SPY");
    expect(pos).toBeDefined();
    expect(pos!.quantity).toBeCloseTo(50); // $5000 / open=$100
  });

  it("revalues position at close price after buy at open", () => {
    // open=100, close=120: bought 50 shares @ 100, now worth 50*120=6000
    const prices: PriceDataMap = new Map([
      ["SPY", [{ date: "2020-01-02", open: 100, high: 125, low: 95, close: 120, volume: 1_000_000 }]],
    ]);
    const state = makeState(createPortfolio(10_000), {
      pendingTrades: [{ ticker: "SPY", action: "buy", amount: 5_000, source: "manual" }],
    });
    const next = advanceTick(state, prices);
    const pos = next.portfolio.positions.find((p) => p.ticker === "SPY")!;
    expect(pos.currentPrice).toBe(120);
    expect(pos.currentValue).toBeCloseTo(6_000); // 50 shares * $120
  });

  it("cash decreases by the buy cost (at open)", () => {
    const prices = makeSeriesMap("SPY", [100, 110]);
    const state = makeState(createPortfolio(10_000), {
      pendingTrades: [{ ticker: "SPY", action: "buy", amount: 3_000, source: "manual" }],
    });
    const next = advanceTick(state, prices);
    expect(next.portfolio.cashBalance).toBeCloseTo(7_000);
  });

  it("multiple pending trades all apply in sequence", () => {
    const prices: PriceDataMap = new Map([
      ["SPY",  [{ date: "2020-01-02", open: 100, high: 105, low: 95, close: 100, volume: 1_000_000 }]],
      ["NVDA", [{ date: "2020-01-02", open: 200, high: 210, low: 190, close: 200, volume: 500_000 }]],
    ]);
    const state = makeState(createPortfolio(10_000), {
      pendingTrades: [
        { ticker: "SPY",  action: "buy", amount: 3_000, source: "manual" },
        { ticker: "NVDA", action: "buy", amount: 3_000, source: "manual" },
      ],
    });
    const next = advanceTick(state, prices);
    expect(next.portfolio.positions).toHaveLength(2);
    expect(next.portfolio.cashBalance).toBeCloseTo(4_000);
  });
});

// ── Portfolio snapshot accuracy ───────────────────────────────────────────────

describe("advanceTick — snapshot accuracy", () => {
  it("snapshot.totalValue mirrors portfolio.totalValue", () => {
    const prices = threeDayPrices();
    const next = advanceTick(makeState(), prices);
    expect(next.history[0].totalValue).toBe(next.portfolio.totalValue);
  });

  it("snapshot.cashBalance mirrors portfolio.cashBalance", () => {
    const prices = threeDayPrices();
    const next = advanceTick(makeState(), prices);
    expect(next.history[0].cashBalance).toBe(next.portfolio.cashBalance);
  });

  it("cumulativeReturn is 0 when totalValue equals startingValue", () => {
    // all-cash portfolio, no positions, price doesn't affect cash
    const prices = threeDayPrices();
    const next = advanceTick(makeState(), prices);
    expect(next.history[0].cumulativeReturn).toBeCloseTo(0, 4);
  });

  it("cumulativeReturn is positive when position gains value", () => {
    // buy 50 shares at open=100, close=200 → doubled
    const prices: PriceDataMap = new Map([
      ["SPY", [{ date: "2020-01-02", open: 100, high: 210, low: 90, close: 200, volume: 1_000_000 }]],
    ]);
    const state = makeState(createPortfolio(10_000), {
      pendingTrades: [{ ticker: "SPY", action: "buy", amount: 10_000, source: "manual" }],
    });
    const next = advanceTick(state, prices);
    expect(next.history[0].cumulativeReturn).toBeGreaterThan(0);
  });
});

// ── DRIP integration ──────────────────────────────────────────────────────────

describe("advanceTick — DRIP flag", () => {
  it("DRIP disabled: position quantity unchanged after tick", () => {
    const prices: PriceDataMap = new Map([
      ["SPY", [
        { date: "2020-01-02", open: 100, high: 102, low: 98, close: 100, volume: 1_000_000 },
        { date: "2020-01-03", open: 100, high: 102, low: 98, close: 100, volume: 1_000_000 },
      ]],
    ]);
    const portfolio = createPortfolio(10_000);
    // Manually seed a position to avoid the pending-trade open-price complexity
    const seededPortfolio: Portfolio = {
      ...portfolio,
      positions: [{
        id: "SPY",
        ticker: "SPY",
        name: "SPY",
        type: "etf",
        quantity: 100,
        entryPrice: 100,
        entryDate: "2020-01-01",
        currentPrice: 100,
        currentValue: 10_000,
      }],
      cashBalance: 0,
      totalValue: 10_000,
    };
    const state = makeState(seededPortfolio, {
      config: makeConfig({ drip: false }),
    });
    const next = advanceTick(state, prices);
    const pos = next.portfolio.positions.find((p) => p.ticker === "SPY")!;
    expect(pos.quantity).toBe(100); // unchanged
  });

  it("DRIP enabled: SPY position quantity grows each tick", () => {
    const prices: PriceDataMap = new Map([
      ["SPY", [
        { date: "2020-01-02", open: 100, high: 102, low: 98, close: 100, volume: 1_000_000 },
        { date: "2020-01-03", open: 100, high: 102, low: 98, close: 100, volume: 1_000_000 },
      ]],
    ]);
    const portfolio: Portfolio = {
      positions: [{
        id: "SPY",
        ticker: "SPY",
        name: "SPY",
        type: "etf",
        quantity: 100,
        entryPrice: 100,
        entryDate: "2020-01-01",
        currentPrice: 100,
        currentValue: 10_000,
      }],
      cashBalance: 0,
      totalValue: 10_000,
      startingValue: 10_000,
    };
    const state = makeState(portfolio, {
      config: makeConfig({ drip: true }),
    });
    const next = advanceTick(state, prices);
    const pos = next.portfolio.positions.find((p) => p.ticker === "SPY")!;
    // SPY yield = 1.8% / 252 per day ≈ 0.00714% → qty > 100
    expect(pos.quantity).toBeGreaterThan(100);
    expect(pos.quantity).toBeCloseTo(100 + 100 * (0.018 / 252), 6);
  });

  it("DRIP enabled: cash balance is unchanged (dividends → shares, not cash)", () => {
    const prices: PriceDataMap = new Map([
      ["SPY", [{ date: "2020-01-02", open: 100, high: 102, low: 98, close: 100, volume: 1_000_000 }]],
    ]);
    const portfolio: Portfolio = {
      positions: [{
        id: "SPY", ticker: "SPY", name: "SPY", type: "etf",
        quantity: 100, entryPrice: 100, entryDate: "2020-01-01",
        currentPrice: 100, currentValue: 10_000,
      }],
      cashBalance: 500,
      totalValue: 10_500,
      startingValue: 10_500,
    };
    const state = makeState(portfolio, { config: makeConfig({ drip: true }) });
    const next = advanceTick(state, prices);
    expect(next.portfolio.cashBalance).toBe(500); // cash unchanged
  });

  it("DRIP enabled: BTC (zero yield) quantity is unchanged", () => {
    const prices: PriceDataMap = new Map([
      ["BTC", [{ date: "2020-01-02", open: 50_000, high: 51_000, low: 49_000, close: 50_000, volume: 5_000 }]],
    ]);
    const portfolio: Portfolio = {
      positions: [{
        id: "BTC", ticker: "BTC", name: "Bitcoin", type: "crypto",
        quantity: 1, entryPrice: 50_000, entryDate: "2020-01-01",
        currentPrice: 50_000, currentValue: 50_000,
      }],
      cashBalance: 0,
      totalValue: 50_000,
      startingValue: 50_000,
    };
    const state = makeState(portfolio, { config: makeConfig({ drip: true }) });
    const next = advanceTick(state, prices);
    const pos = next.portfolio.positions.find((p) => p.ticker === "BTC")!;
    expect(pos.quantity).toBe(1); // no change
  });
});

// ── Multi-tick simulation run ──────────────────────────────────────────────────

describe("advanceTick — full simulation run", () => {
  it("runs to completion in exactly N ticks matching price series length", () => {
    const N = 10;
    const closes = Array.from({ length: N }, (_, i) => 100 + i * 2);
    const prices = makeSeriesMap("SPY", closes);
    let state = makeState();
    let ticks = 0;
    while (!state.isComplete) {
      state = advanceTick(state, prices);
      ticks++;
      if (ticks > N + 5) break; // safety guard
    }
    expect(ticks).toBe(N);
    expect(state.history).toHaveLength(N);
  });

  it("final snapshot date matches last price point date", () => {
    const prices = threeDayPrices();
    let state = makeState();
    while (!state.isComplete) state = advanceTick(state, prices);
    const last = state.history[state.history.length - 1];
    expect(last.date).toBe("2020-01-04"); // day 2 (index 2 from 2020-01-02 + 2 days)
  });

  it("history length equals number of ticks run", () => {
    const prices = makeSeriesMap("SPY", [100, 105, 110, 115, 120]);
    let state = makeState();
    while (!state.isComplete) state = advanceTick(state, prices);
    expect(state.history).toHaveLength(5);
  });
});
