# FRONTEND.md — MoneyBags Frontend Conventions

## Stack

- **Next.js 14** — App Router, TypeScript strict mode
- **Tailwind CSS v3** — utility classes only, no CSS files except globals.css for tokens
- **Recharts** — all data visualization
- **Zustand** — all client state
- **lucide-react** — icons
- **html2canvas** — results card screenshot export
- **pnpm** — package manager

---

## File & Naming Conventions

- Components: `PascalCase.tsx` (e.g. `PortfolioChart.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g. `useSimulation.ts`)
- Stores: `camelCaseStore.ts` (e.g. `simulationStore.ts`)
- Utils/lib: `camelCase.ts` (e.g. `blackScholes.ts`)
- Types: `camelCase.ts` by domain (e.g. `simulation.ts`, `instrument.ts`)
- Pages: `page.tsx` inside App Router directories
- All exports: named exports preferred, default exports for pages only

---

## Component Rules

1. **One component per file.** No barrel re-export files.
2. **Props typed inline** with `interface ComponentNameProps {}` at top of file.
3. **No prop drilling beyond 2 levels.** Use Zustand store or a hook instead.
4. **No business logic in components.** All financial computation in `src/engine/` or `src/lib/`.
5. **Mobile-first Tailwind.** Base classes are mobile. Use `md:` or `lg:` for desktop overrides.
6. **No inline styles.** Tailwind only, except for dynamic chart colors passed as props.
7. **Accessible tap targets.** Minimum `min-h-[44px] min-w-[44px]` on all interactive elements.

---

## State Management

- All global state lives in Zustand stores (`src/store/`)
- Component-local state (e.g. open/closed, hover) uses `useState`
- No `useContext` for business data — use Zustand
- No Redux, no React Query (no server data in v1)
- `leaderboardStore` is the only store that reads/writes `localStorage`

---

## Data Fetching

- Historical price data: fetched with `fetch('/data/{scenario}/{ticker}.json')` inside `src/data/loaders.ts`
- No server-side data fetching in v1 (all pages are client components or static)
- Use React `Suspense` boundaries around data-dependent chart components

---

## Setup Wizard Pattern

The `/setup` page is a multi-step wizard. Each step is a separate component rendered conditionally. State lives in `portfolioStore` and `rulesStore`. Steps:

1. `SetupCapital` — starting amount input
2. `SetupScenario` — scenario picker (presets + custom date range)
3. `SetupPortfolio` — instrument search + allocation
4. `SetupRules` — rule builder (optional)
5. `SetupReview` — summary + launch button

Each step exports a `StepComponentProps` with `onNext()` and `onBack()` callbacks.

---

## Simulation Playback Architecture

The simulation runs tick-by-tick inside a `setInterval` (Movie Mode) or on button press (Step Mode). The interval is managed by `useSimulation()` hook. On each tick:

1. Hook calls `simulationStore.tick()`
2. Store calls `engine/simulator.ts#advanceTick(state, priceData)`
3. Engine returns new `SimulationState`
4. Store updates, components re-render via Zustand subscriptions
5. Narrator hook checks for events and emits chyron/popup messages

Playback speed is controlled by interval duration: 1x = 500ms/tick, 5x = 100ms/tick, 10x = 50ms/tick.

---

## Chart Implementation

Use Recharts `ComposedChart` for the main portfolio chart:
- `Area` for portfolio value (filled, animated)
- `Line` for individual position overlays (toggle-able)
- `ReferenceLine` for historical event markers (e.g. "Lehman collapse")
- `Tooltip` custom component styled to design system
- `ResponsiveContainer` always wraps charts (100% width, fixed height)

---

## Bottom Sheet Pattern

Used for: instrument detail, rule builder, trade confirmation, instrument search.

- Implemented with a `Sheet` component using CSS transform animations
- Backdrop: semi-transparent overlay `bg-black/60`
- Drag handle at top
- Always `position: fixed`, `bottom: 0`, `w-full`
- `z-index: 50`

---

## Ad Integration

AdSense integration via `next/script` with `afterInteractive` strategy. Ad slots:

```tsx
// components/ads/AdBanner.tsx
// Renders a Google AdSense banner
// Falls back to an empty div with min-height to prevent layout shift
// Always shows "Advertisement" label above
```

Never render ads inside:
- Charts or chart containers
- The chyron bar
- The playback controls bar
- Modals/bottom sheets

---

## Performance Rules

- `use client` only where necessary — prefer Server Components for static content
- `React.memo` on expensive chart sub-components
- `useCallback` on callbacks passed to Recharts (prevents chart re-renders)
- Lazy-load the simulation screen and results screen (heavy Recharts bundles)
- Compress all static JSON data files before shipping

---

## Error Handling

- Missing price data for a ticker in a scenario: show a warning card, remove from portfolio
- Rule evaluation error: log to console, skip rule, show narrator message "Your rule broke. Classic."
- Failed JSON load: show error state with retry button
- Projection model failure: fall back to flat projection, show warning

---

## Testing (Future)

- Unit tests: `vitest` for all `src/lib/` and `src/engine/` modules
- Component tests: React Testing Library for key interactive components
- Structural tests: custom ESLint rules for layer dependency enforcement
