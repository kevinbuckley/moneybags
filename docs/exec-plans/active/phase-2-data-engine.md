# Exec Plan: Phase 2 — Data & Engine

**Status:** Active
**Goal:** Simulation engine works end-to-end with real historical data.

## Already Done (Phase 1)
- [x] `src/lib/math.ts` — returns, volatility, Sharpe, drawdown, beta
- [x] `src/lib/blackScholes.ts` — options pricing + Greeks + historicalVolatility
- [x] `src/lib/monteCarlo.ts` — future projection random walk
- [x] `src/lib/correlation.ts` — pairwise correlation for dispersion trades
- [x] `src/lib/narrator.ts` — message generation
- [x] `src/lib/format.ts` — currency, % , date formatting
- [x] `src/engine/analytics.ts` — Sharpe, drawdown, volatility, beta
- [x] `src/engine/projection.ts` — extends price series with Monte Carlo
- [x] `src/engine/options.ts` — option fair value, expiry, intrinsic value
- [x] `src/data/loaders.ts` — fetch + cache JSON price files
- [x] `src/data/scenarios.ts` — all 6 scenarios defined
- [x] `src/data/instruments.ts` — master instrument list

## Phase 2 Tasks

### Step 1: Historical Data
- [ ] Create `scripts/source-data.mjs` — fetches Yahoo Finance OHLCV for all instruments × scenarios
- [ ] Run script → populate `public/data/{scenario}/{TICKER}.json`
- [ ] Commit data files

### Step 2: Engine Implementation
- [ ] Implement `src/engine/portfolio.ts` (full buy/sell/rebalance/move_to_cash)
- [ ] Implement `src/engine/rules.ts` (full condition evaluation for all RuleSubject types)
- [ ] Implement `src/engine/simulator.ts` (full tick: trades → rules → options → price update → narrator → snapshot)

### Step 3: Wire & Verify
- [ ] Verify Zustand store tick calls full engine (already wired in Phase 1, check it works)
- [ ] Run `pnpm test` (tsc + eslint)
- [ ] Commit + push

## Instrument × Scenario Matrix

| Ticker | 2008 | dotcom | black-mon | covid | 2021 | 2022-crypto |
|--------|------|--------|-----------|-------|------|-------------|
| SPY    | ✓    | ✓      |           | ✓     | ✓    | ✓           |
| QQQ    | ✓    | ✓      |           | ✓     | ✓    | ✓           |
| GLD    | ✓    | ✓      |           | ✓     | ✓    | ✓           |
| TLT    | ✓    |        |           | ✓     | ✓    | ✓           |
| AAPL   | ✓    | ✓      |           | ✓     | ✓    | ✓           |
| MSFT   | ✓    | ✓      |           | ✓     | ✓    | ✓           |
| AMZN   | ✓    | ✓      |           | ✓     | ✓    | ✓           |
| TSLA   |      |        |           | ✓     | ✓    | ✓           |
| NVDA   |      |        |           | ✓     | ✓    | ✓           |
| GME    |      |        |           |       | ✓    |             |
| NFLX   | ✓    |        |           | ✓     | ✓    | ✓           |
| JPM    | ✓    |        |           | ✓     | ✓    | ✓           |
| GS     | ✓    |        |           | ✓     | ✓    | ✓           |
| BTC-USD|      |        |           | ✓     | ✓    | ✓           |
| ETH-USD|      |        |           | ✓     | ✓    | ✓           |
| DOGE-USD|     |        |           |       | ✓    | ✓           |
| SOL-USD|      |        |           |       | ✓    | ✓           |
| TQQQ   |      |        |           | ✓     | ✓    | ✓           |
| SQQQ   |      |        |           | ✓     | ✓    | ✓           |
| ^GSPC  |      |        | ✓         |       |      |             |
| ^DJI   |      |        | ✓         |       |      |             |
| IBM    |      |        | ✓         |       |      |             |

## Definition of Done

Phase 2 is complete when:
1. All JSON data files exist in `public/data/`
2. `engine/portfolio.ts` handles buy, sell_pct, sell_all, rebalance, move_to_cash
3. `engine/rules.ts` evaluates all 7 RuleSubject types correctly
4. `engine/simulator.ts` advances state correctly (values update from prices)
5. `pnpm test` passes (tsc + eslint)
6. Committed and pushed
