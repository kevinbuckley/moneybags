# Simulation Engine Design

**Module:** `src/engine/simulator.ts`
**Dependencies:** `src/types/`, `src/lib/math.ts`, `src/engine/portfolio.ts`, `src/engine/rules.ts`

---

## Overview

The simulation engine advances a portfolio through time, one tick at a time. A "tick" is one time period (daily in historical mode, configurable in projection mode). The engine is a pure function — given a `SimulationState` and the full price data map, it returns a new `SimulationState`.

---

## Core Types

```typescript
// SimulationState — complete snapshot at one point in time
interface SimulationState {
  currentDateIndex: number          // index into the scenario date series
  portfolio: Portfolio               // current holdings + cash
  history: PortfolioSnapshot[]       // one snapshot per past tick
  rulesLog: RuleFireEvent[]          // log of all rule triggers
  narratorQueue: NarratorEvent[]     // pending narrator messages
  isComplete: boolean                // true when simulation reaches end date
}

// PortfolioSnapshot — what we record each tick for the chart
interface PortfolioSnapshot {
  date: string
  totalValue: number                 // cash + all positions at close price
  cashBalance: number
  positions: PositionSnapshot[]
  dayReturn: number                  // % change from previous tick
}

// PositionSnapshot — position value at a point in time
interface PositionSnapshot {
  ticker: string
  value: number
  quantity: number
  closePrice: number
  dayReturn: number
}
```

---

## Tick Function

```typescript
function advanceTick(
  state: SimulationState,
  priceData: PriceDataMap,          // Map<ticker, PriceSeries>
  pendingTrades?: TradeOrder[],     // manual trades submitted this tick
): SimulationState
```

### Tick Sequence

1. Get current date from `state.currentDateIndex`
2. Apply any `pendingTrades` (buy/sell orders submitted manually)
3. Evaluate all rules against current state + new prices → collect triggered rule actions
4. Apply triggered rule actions (buy/sell/rebalance)
5. Mark options that expired on this date as exercised or worthless
6. Compute new position values using today's close prices
7. Compute portfolio total value = sum(positions) + cash
8. Generate narrator events for significant changes
9. Record `PortfolioSnapshot` into history
10. Advance `currentDateIndex` by 1
11. Set `isComplete = true` if we've reached the last date

### Special Cases

- **Option expiry:** If an option's expiry date falls within the current tick, exercise or expire it before computing portfolio value
- **Margin call:** If leveraged position losses exceed 50% of collateral, trigger forced liquidation with narrator event
- **Dispersion trade settlement:** Settled at end of defined measurement window per dispersion trade spec

---

## Projection Mode

When `currentDateIndex` exceeds the historical data length, the engine switches to projection mode:

- Price data comes from `src/engine/projection.ts` (Monte Carlo, pre-generated at simulation start)
- All other logic identical to historical mode
- All snapshots tagged `projected: true`
- Narrator treats projected data differently ("According to our extremely sophisticated model that we definitely didn't write in 20 minutes...")

---

## Performance Constraints

- `advanceTick` must complete in < 16ms to maintain 60fps playback
- Pre-compute the full projected price series at simulation start, not per-tick
- Pre-load all required JSON price files before simulation starts (via `src/data/loaders.ts`)
- Portfolio value computation: O(n) where n = number of positions — must stay simple

---

## Manual Trades

Manual trades arrive as `TradeOrder[]` from the Zustand store. They are applied at the start of the tick (before rule evaluation), using the current tick's open price.

```typescript
interface TradeOrder {
  ticker: string
  action: 'buy' | 'sell' | 'rebalance'
  amount?: number          // dollar amount (for buy)
  quantity?: number        // share/contract quantity (for sell)
  targetPct?: number       // 0-1 (for rebalance to % of portfolio)
}
```
