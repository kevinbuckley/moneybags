# PLANS.md — MoneyBags Roadmap

## Phase 1 — Foundation & Scaffold ✅
**Goal:** Working Next.js app with full harness in place. No real simulation yet.

- [x] Initialize Next.js project with TypeScript strict, Tailwind, pnpm
- [x] Configure Tailwind with custom design tokens (DESIGN.md)
- [x] Set up ESLint with layer dependency rules
- [x] Implement all TypeScript types (`src/types/`)
- [x] Scaffold all pages (landing, how-to-play, setup, simulate, results, leaderboard)
- [x] Build core UI primitives (Button, Card, Badge, Input, Sheet)
- [x] Integrate Google AdSense placeholder slots
- [x] Set up Zustand stores (skeleton)

---

## Phase 2 — Data & Engine ✅
**Goal:** Simulation engine works end-to-end with real historical data.

- [x] Source and clean historical OHLCV data for all 6 scenarios × core instrument set
- [x] Implement `src/lib/math.ts` (returns, volatility, Sharpe, drawdown)
- [x] Implement `src/lib/blackScholes.ts` (options pricing)
- [x] Implement `src/lib/monteCarlo.ts` (future projection)
- [x] Implement `src/lib/correlation.ts` (dispersion trade support)
- [x] Implement `src/engine/simulator.ts` (core tick function)
- [x] Implement `src/engine/portfolio.ts` (buy/sell/rebalance)
- [x] Implement `src/engine/options.ts` (options lifecycle)
- [x] Implement `src/engine/rules.ts` (conditional rule evaluation)
- [x] Implement `src/engine/analytics.ts` (Sharpe, drawdown, volatility, beta)
- [x] Implement `src/engine/projection.ts` (Monte Carlo future simulation)
- [x] Implement `src/data/loaders.ts` (JSON fetching + parsing)
- [x] Wire Zustand stores to engine

---

## Phase 3 — Core UX Flows ✅
**Goal:** Full user journey works on mobile.

- [x] Setup wizard (capital → scenario → portfolio → rules → review)
- [x] Instrument search with autocomplete
- [x] Allocation builder (sliders + number inputs)
- [x] Rule builder (dropdown-based, phone-friendly)
- [x] Simulation playback (Movie Mode + Step Mode)
- [x] Manual trade actions during simulation
- [x] Chyron narrator (scrolling bottom ticker)
- [x] Popup notifications (event-triggered)
- [x] Results screen (all analytics + charts)
- [x] Share card (html2canvas PNG export)
- [x] Leaderboard (localStorage)

---

## Phase 4 — Polish & Launch
**Goal:** Production-ready, performant, delightful.

- [x] Historical event markers on simulation chart
- [x] Landing page (hero, features, social proof)
- [x] How to Play page
- [x] SEO metadata + OG tags
- [ ] Snarky narrator copy — full message library
- [ ] Performance optimization (lazy loading, JSON compression)
- [ ] OG social share images (code/SVG-based)

---

## Phase 5 — Growth (Post-launch)
- [ ] User accounts + saved simulations (auth)
- [ ] Crowd-sourced leaderboard (lightweight API)
- [ ] More instruments and scenarios
- [ ] AI-generated narrator commentary (LLM-powered)
