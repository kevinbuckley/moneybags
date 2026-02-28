# Phase 3 Exec Plan — Full UX

## Context
Phase 1 (scaffold) and Phase 2 (engine + data) are complete. All types, stores, hooks, and engine functions work. Pages and component directories exist but are stubs. Phase 3 builds the full user-facing app: landing polish, setup wizard, simulation playback, results, and leaderboard.

## Architecture Notes
- **Stores** (simulationStore, portfolioStore, rulesStore, leaderboardStore) are fully wired — just need UI to drive them
- **Hooks** (useSimulation, useNarrator, useAnalytics, usePortfolio, useRules) are complete
- **UI primitives** (Button, Card, Input, Badge, Sheet, Tabs, Spinner) are done
- **Data loader** (loadPriceDataMap) is ready for use in initSimulation
- **Engine** (advanceTick, applyTrade, evaluateRules, computeAnalytics) is fully implemented
- Layer rule: components can import from hooks/stores/lib — NOT from engine directly

---

## Step 3A — Shared components + Landing polish ✅
**Commit 1 of 4**

- `src/components/charts/PortfolioChart.tsx` — Recharts AreaChart with scenario event markers
- `src/components/narrator/NarratorChyron.tsx` — scrolling ticker tape (marquee)
- `src/components/narrator/NarratorPopup.tsx` — stacked auto-dismiss popup notifications
- `src/app/page.tsx` — polished landing with 6 scenario cards + stats line

---

## Step 3B — Setup Wizard (5 steps)
**Commit 2 of 4**

Update `src/app/setup/page.tsx` — wire all 5 steps:

**Step 1 — Capital**: Input + preset chips ($1K / $10K / $100K), constrained $1K–$1B
**Step 2 — Scenario**: Grid of 6 scenario cards, click to select
**Step 3 — Portfolio**: Instrument search, allocation % inputs, auto-normalize
**Step 4 — Rules**: Full rule builder Sheet form (7 subjects, 5 actions, up to 3 conditions, cooldown)
**Step 5 — Review**: Summary table + "Launch Simulation" button (loadPriceDataMap → initSimulation → /simulate)

---

## Step 3C — Simulation Page (full playback)
**Commit 3 of 4**

New files:
- `src/components/simulation/PlaybackControls.tsx` — Play/Pause, Step, speed selector, date + tick progress
- `src/components/simulation/PortfolioPanel.tsx` — Total value, positions list, Trade button
- `src/components/simulation/TradePanel.tsx` — Sheet form for manual trades

Update `src/app/simulate/page.tsx`:
- Full layout: PortfolioPanel + PortfolioChart + PlaybackControls + NarratorChyron + NarratorPopup
- Redirect to /results when isComplete

---

## Step 3D — Results + Leaderboard
**Commit 4 of 4**

New files:
- `src/components/results/AnalyticsGrid.tsx` — 2×2 card grid: Sharpe, Drawdown, Volatility, Beta
- `src/components/results/ShareCard.tsx` — Share card with html2canvas PNG export

Update `src/app/results/page.tsx` — full analytics display, leaderboard entry submission
Update `src/app/leaderboard/page.tsx` — live data sorted by totalReturnPct

---

## Key Implementation Decisions

1. **PortfolioChart X-axis**: `date` string from PortfolioSnapshot; `formatDate(d, true)` for short format
2. **Scenario event markers**: Recharts `ReferenceLine` at event dates (dotted accent stroke)
3. **Setup wizard state**: local React state (`useState<Step>`), not a store — ephemeral
4. **Instrument ticker picker in rules**: dropdown filtered to selected scenario's instruments
5. **initSimulation flow**: loadPriceDataMap → initSimulation → router.push('/simulate'); spinner shown
6. **TradePanel**: Sheet component with local form state
7. **Results page guard**: if `simulationStore.state === null`, redirect to /setup

## Verification

After each step: `pnpm test` (tsc + eslint), commit (no Co-Authored-By), push.

Full flow test:
- Landing → /setup → 5 steps → Launch → /simulate → Play → completes → /results → /leaderboard
