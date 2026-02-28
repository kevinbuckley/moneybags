# PLANS.md — MoneyBags Roadmap

## Phase 1 — Foundation & Scaffold (Current)
**Goal:** Working Next.js app with full harness in place. No real simulation yet.

- [ ] Initialize Next.js 14 project with TypeScript strict, Tailwind, pnpm
- [ ] Configure Tailwind with custom design tokens (DESIGN.md)
- [ ] Set up ESLint with layer dependency rules
- [ ] Implement all TypeScript types (`src/types/`)
- [ ] Scaffold all pages (landing, how-to-play, setup, simulate, results, leaderboard)
- [ ] Build core UI primitives (Button, Card, Badge, Input, Sheet)
- [ ] Integrate Google AdSense placeholder slots
- [ ] Set up Zustand stores (skeleton)
- [ ] Configure Vercel deployment

See: [docs/exec-plans/active/phase-1-scaffold.md](./exec-plans/active/phase-1-scaffold.md)

---

## Phase 2 — Data & Engine
**Goal:** Simulation engine works end-to-end with real historical data.

- [ ] Source and clean historical OHLCV data for all 6 scenarios × core instrument set
- [ ] Implement `src/lib/math.ts` (returns, volatility, Sharpe, drawdown)
- [ ] Implement `src/lib/blackScholes.ts` (options pricing)
- [ ] Implement `src/lib/monteCarlo.ts` (future projection)
- [ ] Implement `src/lib/correlation.ts` (dispersion trade support)
- [ ] Implement `src/engine/simulator.ts` (core tick function)
- [ ] Implement `src/engine/portfolio.ts` (buy/sell/rebalance)
- [ ] Implement `src/engine/options.ts` (options lifecycle)
- [ ] Implement `src/engine/rules.ts` (conditional rule evaluation)
- [ ] Implement `src/engine/analytics.ts` (Sharpe, drawdown, volatility, beta)
- [ ] Implement `src/engine/projection.ts` (Monte Carlo future simulation)
- [ ] Implement `src/data/loaders.ts` (JSON fetching + parsing)
- [ ] Wire Zustand stores to engine

---

## Phase 3 — Core UX Flows
**Goal:** Full user journey works on mobile.

- [ ] Setup wizard (capital → scenario → portfolio → rules → review)
- [ ] Instrument search with autocomplete
- [ ] Allocation builder (sliders + number inputs)
- [ ] Rule builder (dropdown-based, phone-friendly)
- [ ] Simulation playback (Movie Mode + Step Mode)
- [ ] Manual trade actions during simulation
- [ ] Chyron narrator (scrolling bottom ticker)
- [ ] Popup notifications (event-triggered)
- [ ] Results screen (all analytics + charts)
- [ ] Share card (html2canvas PNG export)
- [ ] Leaderboard (localStorage)

---

## Phase 4 — Polish & Launch
**Goal:** Production-ready, performant, delightful.

- [ ] Snarky narrator copy — full library of messages
- [ ] Historical event markers on simulation chart
- [ ] Scenario preset cards (art/illustration for each scenario)
- [ ] Landing page (hero, features, social proof)
- [ ] How to Play page
- [ ] Performance optimization (lazy loading, JSON compression)
- [ ] Mobile QA on iOS Safari, Chrome Android
- [ ] AdSense live integration
- [ ] SEO metadata, OG images
- [ ] Deploy to production Vercel

---

## Phase 5 — Growth (Post-launch)
- [ ] User accounts + saved simulations (auth)
- [ ] Crowd-sourced leaderboard (lightweight API)
- [ ] More instruments and scenarios
- [ ] AI-generated narrator commentary (LLM-powered)
- [ ] Real-time data mode
- [ ] Native mobile app consideration
