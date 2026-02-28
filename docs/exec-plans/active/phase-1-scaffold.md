# Exec Plan: Phase 1 — Foundation & Scaffold

**Status:** Active
**Goal:** Working Next.js app with full harness in place. No real simulation logic yet — just the skeleton that everything else hangs on.

---

## Checklist

### Project Init
- [ ] `pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir` (or with src dir per ARCHITECTURE.md)
- [ ] Configure `tsconfig.json` for strict mode
- [ ] Configure `tailwind.config.ts` with custom design tokens from `docs/DESIGN.md`
- [ ] Install dependencies: `zustand`, `recharts`, `lucide-react`, `html2canvas`
- [ ] Set up `pnpm` as package manager (delete yarn.lock if present)
- [ ] Add `.gitignore`, `README.md` placeholder

### TypeScript Types (`src/types/`)
- [ ] `instrument.ts` — `Instrument`, `InstrumentType`, `PricePoint`, `PriceSeries`, `PriceDataMap`
- [ ] `portfolio.ts` — `Position`, `Portfolio`, `PortfolioSnapshot`, `PositionSnapshot`, `TradeOrder`
- [ ] `simulation.ts` — `SimulationState`, `SimulationConfig`, `PlaybackMode`, `TimeGranularity`
- [ ] `rules.ts` — `Rule`, `RuleCondition`, `RuleAction`, `RuleSubject`, `RuleOperator`, `RuleActionType`, `RuleFireEvent`
- [ ] `scenario.ts` — `Scenario`, `ScenarioEvent`
- [ ] `narrator.ts` — `NarratorEvent`, `NarratorTrigger`, `NarratorContext`
- [ ] `analytics.ts` — `SimulationAnalytics`
- [ ] `leaderboard.ts` — `LeaderboardEntry`

### Folder Structure
- [ ] Create `src/app/` with all page.tsx stubs (landing, how-to-play, setup, simulate, results, leaderboard)
- [ ] Create `src/components/ui/`, `charts/`, `simulation/`, `portfolio/`, `rules/`, `results/`, `narrator/`, `ads/`
- [ ] Create `src/engine/` stubs (simulator.ts, portfolio.ts, options.ts, rules.ts, analytics.ts, projection.ts)
- [ ] Create `src/lib/` stubs (math.ts, format.ts, blackScholes.ts, monteCarlo.ts, correlation.ts, narrator.ts)
- [ ] Create `src/store/` stubs (simulationStore.ts, portfolioStore.ts, rulesStore.ts, leaderboardStore.ts)
- [ ] Create `src/hooks/` stubs (useSimulation.ts, usePortfolio.ts, useNarrator.ts, useAnalytics.ts)
- [ ] Create `src/data/` stubs (scenarios.ts, instruments.ts, loaders.ts)
- [ ] Create `public/data/` directory structure (empty, per data-layer.md)

### ESLint Config
- [ ] Add custom ESLint rule to enforce layer dependency model (no upward imports)
- [ ] Verify `engine/` cannot import from `react` or `zustand`

### UI Primitives (`src/components/ui/`)
- [ ] `Button.tsx` — primary, secondary, ghost variants
- [ ] `Card.tsx` — base card container
- [ ] `Badge.tsx` — gain, loss, neutral, type badges
- [ ] `Input.tsx` — text + number variants
- [ ] `Sheet.tsx` — bottom sheet container
- [ ] `Spinner.tsx` — loading state
- [ ] `Tabs.tsx` — tab bar component

### Root Layout (`src/app/layout.tsx`)
- [ ] Dark background applied globally
- [ ] Inter + JetBrains Mono fonts loaded (Google Fonts or local)
- [ ] AdSense script tag (placeholder slot IDs)
- [ ] Meta tags (title, description, OG image placeholder)

### Page Stubs
Each page stub should:
- Render a heading with the page name
- Import and render the correct layout shell
- Have `'use client'` directive where needed

Pages:
- [ ] `/` — landing
- [ ] `/how-to-play` — tutorial
- [ ] `/setup` — wizard (5-step shell, no real logic)
- [ ] `/simulate` — simulation (static placeholder chart)
- [ ] `/results` — results (static placeholder analytics)
- [ ] `/leaderboard` — leaderboard (empty state)

### Ad Slots
- [ ] `AdBanner.tsx` — renders AdSense banner, min-height fallback
- [ ] `AdCard.tsx` — renders AdSense card, min-height fallback
- [ ] `AdInterstitial.tsx` — renders between-session interstitial (modal variant)

### Vercel Config
- [ ] `vercel.json` with any needed headers (CSP from SECURITY.md)
- [ ] Confirm build passes with `pnpm build`
- [ ] Confirm deploy to Vercel preview URL

---

## Definition of Done

Phase 1 is complete when:
1. `pnpm build` succeeds with zero errors
2. All 6 pages render (even as stubs) at their routes
3. All TypeScript types defined with no `any`
4. ESLint layer rule active and passing
5. Deployed to Vercel preview URL
6. Dark theme applied, fonts loaded

---

## Notes for Agents

- Read `ARCHITECTURE.md` before creating any files — the layer model must be respected from day 1
- Read `docs/DESIGN.md` before creating any UI components — use only design tokens, no hardcoded colors
- Stub files should export their expected types/functions with `TODO` implementations, not empty files
- All store files should export a Zustand store hook even if the state is empty initially
