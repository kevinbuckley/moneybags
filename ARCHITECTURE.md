# ARCHITECTURE.md — MoneyBags System Architecture

## Overview

MoneyBags is a **fully client-side Next.js application** with no backend or database in v1. All computation happens in the browser. State is ephemeral (Zustand, in-memory). Historical price data is shipped as static JSON files. Deployment is Vercel static/edge.

---

## Dependency Layer Model

Code may only import from layers at the same level or below. Never upward.

```
┌─────────────────────────────────┐
│  app (Next.js pages/routes)     │  ← Layer 7 (top)
├─────────────────────────────────┤
│  components (React UI)          │  ← Layer 6
├─────────────────────────────────┤
│  hooks (React hooks)            │  ← Layer 5
├─────────────────────────────────┤
│  store (Zustand state)          │  ← Layer 4
├─────────────────────────────────┤
│  engine (simulation logic)      │  ← Layer 3
├─────────────────────────────────┤
│  data (loaders, schemas)        │  ← Layer 2
├─────────────────────────────────┤
│  lib (math, utils, formatters)  │  ← Layer 1
├─────────────────────────────────┤
│  types (TypeScript types only)  │  ← Layer 0 (bottom)
└─────────────────────────────────┘
```

### Rules
- `types/` imports nothing from `src/`
- `lib/` imports only from `types/`
- `engine/` imports from `types/`, `lib/`, `data/` — **zero React imports**
- `store/` imports from `types/`, `lib/`, `engine/`
- `hooks/` imports from `types/`, `lib/`, `store/`
- `components/` imports from `types/`, `lib/`, `hooks/`, `store/`
- `app/` imports from all layers

---

## Module Map

### `src/types/`
All shared TypeScript interfaces and types. No logic, no imports from src.

Key types:
- `Instrument` — a tradeable asset (stock, ETF, crypto, bond, option, etc.)
- `Position` — a holding in a portfolio (instrument + quantity + entry price)
- `Portfolio` — collection of positions + cash balance
- `Scenario` — a historical or custom date range with metadata
- `PricePoint` — `{ date: string, open: number, high: number, low: number, close: number, volume: number }`
- `PriceSeries` — `PricePoint[]` for one instrument over a scenario
- `SimulationState` — full state of a running simulation (portfolio, current date, history)
- `Rule` — a conditional trigger + action
- `NarratorEvent` — a narration message with type (chyron | popup) and trigger

### `src/lib/`
Pure utility functions. No state, no side effects.

Modules:
- `math.ts` — financial math (returns, volatility, Sharpe, drawdown, Black-Scholes)
- `format.ts` — currency, percentage, date formatting
- `blackScholes.ts` — options pricing (see design doc)
- `monteCarlo.ts` — future projection random walk generator
- `correlation.ts` — correlation matrix calculation for dispersion trades
- `narrator.ts` — narration message generator (pure function, takes state, returns string)

### `src/data/`
Static data loaders and scenario definitions.

Modules:
- `scenarios.ts` — array of preset `Scenario` objects with metadata
- `instruments.ts` — master list of supported instruments with metadata
- `loaders.ts` — functions to fetch and parse `public/data/{scenario}/{ticker}.json`

### `src/engine/`
The simulation engine. Pure TypeScript. No React, no Zustand, no browser APIs.

Modules:
- `simulator.ts` — core tick function: given `SimulationState` + `PriceSeries` map, advance one time step
- `portfolio.ts` — portfolio mutation functions (buy, sell, rebalance)
- `options.ts` — options lifecycle (expiry, exercise, P&L)
- `rules.ts` — rule evaluation engine (check conditions, execute actions)
- `analytics.ts` — compute Sharpe, drawdown, volatility, beta from history
- `projection.ts` — generate future price series using Monte Carlo

### `src/store/`
Zustand stores. No business logic — delegates to engine.

Stores:
- `simulationStore.ts` — active simulation state, playback controls
- `portfolioStore.ts` — portfolio construction during setup
- `rulesStore.ts` — rules builder state
- `leaderboardStore.ts` — localStorage-persisted leaderboard

### `src/hooks/`
React hooks for consuming store + engine.

Key hooks:
- `useSimulation()` — controls playback, returns current state
- `usePortfolio()` — portfolio builder actions
- `useNarrator()` — subscribes to narrator events
- `useAnalytics()` — derives analytics from simulation history

### `src/components/`
Reusable UI components. Organized by domain:

```
components/
├── ui/           ← Primitives (Button, Card, Badge, Sheet, etc.)
├── charts/       ← PortfolioChart, DrawdownChart, AllocationDonut
├── simulation/   ← PlaybackControls, SimulationTimeline, EventPopup
├── portfolio/    ← InstrumentSearch, PositionCard, AllocationSlider
├── rules/        ← RuleBuilder, RuleCard, RuleList
├── results/      ← ResultsSummary, AnalyticsPanel, ShareCard
├── narrator/     ← Chyron, PopupNotification
└── ads/          ← AdBanner, AdCard, AdInterstitial
```

### `src/app/`
Next.js App Router pages.

```
app/
├── page.tsx              ← Landing page (/)
├── how-to-play/page.tsx  ← Tutorial (/how-to-play)
├── setup/page.tsx        ← Setup wizard (/setup)
├── simulate/page.tsx     ← Simulation screen (/simulate)
├── results/page.tsx      ← Results screen (/results)
├── leaderboard/page.tsx  ← Leaderboard (/leaderboard)
└── layout.tsx            ← Root layout (dark theme, fonts, global nav)
```

### `public/data/`
Static historical price data as JSON.

```
public/data/
├── 2008-crisis/
│   ├── SPY.json
│   ├── AAPL.json
│   ├── BTC.json
│   └── ...
├── dotcom-bubble/
├── black-monday/
├── covid-crash/
├── 2021-bull-run/
└── 2022-crypto-winter/
```

---

## Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSG-friendly, Vercel-native, React ecosystem |
| Styling | Tailwind CSS v3 | Utility-first, great with dark mode, mobile-first |
| Charts | Recharts | React-native, dark mode support, animation, good mobile UX |
| State | Zustand | Lightweight, no boilerplate, works well client-only |
| TypeScript | Strict mode | Enforced via tsconfig, no `any` allowed |
| Package manager | pnpm | Fast, efficient disk usage |
| Options pricing | Black-Scholes (European) | Industry standard, implementable in pure TS |
| Future projection | Monte Carlo random walk | Parameterized by historical volatility and correlation |
| Ads | Google AdSense | Broad inventory, easy Next.js integration |
| Share card | html2canvas | Client-side PNG generation, no server needed |
| Linting | ESLint + custom layer rules | Enforce dependency layer model |

---

## Data Architecture

### Historical Data Format
Each instrument's price data for a scenario is a JSON file at `public/data/{scenario-slug}/{ticker}.json`:

```json
{
  "ticker": "SPY",
  "name": "SPDR S&P 500 ETF",
  "scenario": "2008-crisis",
  "currency": "USD",
  "series": [
    { "date": "2008-01-02", "open": 146.21, "high": 146.32, "low": 143.11, "close": 144.93, "volume": 123456789 },
    ...
  ]
}
```

### Future Projection Format
Generated at runtime by `src/engine/projection.ts`. Same `PricePoint[]` shape as historical, tagged with `projected: true` metadata.

### Options Data
Options are priced at runtime using Black-Scholes. No pre-stored options price series. The engine computes fair value using the underlying price series + configured strike/expiry.

---

## Architectural Constraints (Enforced)

1. `src/engine/` must never import from `react`, `zustand`, or any UI library — verified by ESLint rule
2. `src/types/` must never import from any other `src/` module
3. All financial calculations must live in `src/lib/` or `src/engine/`, never in components
4. `public/data/` JSON files must conform to the schema in `docs/generated/data-schema.md`
5. All components must be mobile-first (375px breakpoint as base)
6. No hardcoded colors — use only Tailwind classes from the design token set in `docs/DESIGN.md`
7. No `localStorage` access outside of `src/store/leaderboardStore.ts`

---

## Non-Goals (v1)

- No server-side rendering of simulation data
- No user authentication or accounts
- No real-time market data
- No WebSocket connections
- No database
- No API routes (Next.js API routes unused in v1)
