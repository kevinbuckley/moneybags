# MoneyBags — Product Specification

## Overview

MoneyBags is a mobile-first, dark-mode financial simulator built with Next.js and deployed to Vercel. Users invest $10,000 of fake money across real financial instruments, run their portfolio through famous historical market events or custom date ranges, and watch (or step through) how their decisions play out — all narrated by a snarky, roast-happy commentary system. The tone is professional enough to feel legit, silly enough to make finance fun.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS
- **Charts:** Recharts or Tremor (mobile-friendly, dark mode capable)
- **State:** Zustand (client-side only, fully stateless — no auth, no database v1)
- **Ads:** Google AdSense or similar
- **Data:** Static JSON datasets (historical), statistical model (future projections)

---

## Screens & Navigation

### 1. Landing Page (`/`)
- Marketing page explaining MoneyBags
- Hero: bold tagline, CTA → "Start Simulating"
- Brief feature highlights (scenarios, instruments, snark)
- Footer with "How to Play" link
- Ad placement: top banner

### 2. How to Play (`/how-to-play`)
- Step-by-step tutorial walkthrough
- Explains instruments, rules engine, simulation playback
- Illustrated with example screenshots

### 3. Setup Flow (`/setup`)
Multi-step mobile-friendly wizard:
1. **Starting Capital** — default $10,000, editable
2. **Choose Scenario** — preset historical events or custom date range
3. **Build Portfolio** — search and add instruments, set allocations
4. **Set Rules** — optional conditional logic rules
5. **Review & Launch**

### 4. Simulation Screen (`/simulate`)
- Portfolio chart animating over time (play/pause/step controls)
- Current portfolio value prominently displayed
- News chyron at bottom with snarky commentary
- Pop-up notifications on major events
- Manual buy/sell/rebalance controls available during playback
- Ad placement: small non-intrusive banner above chyron

### 5. Results Screen (`/results`)
- Final portfolio value + % gain/loss (big, prominent)
- Portfolio value chart over full simulation period
- Breakdown by instrument (allocation + performance)
- Analytics panel: Sharpe ratio, max drawdown, volatility, best/worst day
- Snarky summary from the narrator
- **Shareable results card** (screenshot-optimized, social-ready)
- CTA: "Try Again" / "Try a Different Scenario"
- Ad placement: card between results sections

### 6. Leaderboard (`/leaderboard`)
- Best % returns across all simulations (stored in localStorage, optionally crowd-sourced later)
- Worst % returns (hall of shame)
- Filter by scenario
- Ad placement: sidebar or between rows

---

## Financial Instruments

All instruments use real historical data from static datasets.

### Supported Instruments

| Category | Examples |
|----------|----------|
| Stocks | AAPL, TSLA, MSFT, GME, AMZN, NVDA, etc. |
| ETFs / Index Funds | SPY, QQQ, VTI, GLD, etc. |
| Crypto | BTC, ETH, DOGE, SOL, etc. |
| Bonds | TLT (20yr Treasury ETF), AGG (aggregate bond), etc. |
| Options | Calls, puts, spreads (bull/bear), straddles, iron condors |
| Leveraged Positions | 2x/3x long or short on any supported asset |
| Short Selling | Short any supported stock/ETF |
| Dispersion Trades | Bet on correlation divergence between index and constituents |

### Portfolio Construction
- Allocate by % or by dollar amount
- Minimum position size: $100
- Cash position always shown
- Instrument search with autocomplete

---

## Historical Scenarios

### Preset Scenarios

| Name | Date Range | Vibe |
|------|------------|------|
| 2008 Financial Crisis | Jan 2008 – Mar 2009 | Everything burns |
| Dot-com Bubble | Jan 2000 – Oct 2002 | Tech goes to zero |
| Black Monday | Oct 1–31, 1987 | Single-day chaos |
| COVID Crash + Recovery | Jan 2020 – Dec 2020 | V-shaped whiplash |
| 2020–2021 Bull Run | Apr 2020 – Nov 2021 | Number only go up |
| 2022 Crypto Winter | Jan 2022 – Dec 2022 | Tears and LUNA |

### Custom Date Range
- Date picker for start/end date
- Constrained to available historical data range
- Warning shown if instruments have limited data in selected range

---

## Simulation Engine

### Playback Modes
1. **Movie Mode** — automated playback, user watches portfolio animate in real time with speed control (1x, 5x, 10x)
2. **Step Mode** — user manually advances time period by period (daily, weekly, or monthly granularity, user-selectable)

### During Simulation
- User can pause at any time (Movie Mode) or between steps (Step Mode)
- **Manual actions available:**
  - Buy more of an existing position
  - Sell part or all of a position
  - Add a new instrument (if in portfolio and cash available)
  - Rebalance to target allocations
- Triggered rules fire automatically with a pop-up notification

### Data Model
- Price data stored as static JSON per instrument per scenario
- Future projection (beyond historical data end): statistically generated using historical volatility, mean reversion, and correlation matrices from the selected scenario's base period
- Future data is clearly labeled "Projected" in UI

---

## Conditional Rules Engine

### Rule Structure
Each rule has:
- **Trigger condition** (IF)
- **Action** (THEN)
- **Optional secondary condition** (AND)

### Trigger Conditions
- Any position drops/rises by X%
- Portfolio total drops/rises by X%
- Any position exceeds X% of total portfolio
- Cash drops below $X
- A specific date is reached
- Market (SPY) drops/rises by X%

### Actions
- Buy $X or X% of cash into [instrument]
- Sell X% or all of [instrument]
- Rebalance to original target allocations
- Move X% of portfolio to cash

### Multi-Condition Example
> IF TSLA drops 10% AND SPY is down 5% → Buy $500 of TSLA

### UI
- Phone-friendly rule builder: dropdowns + number inputs
- Max 10 rules per simulation
- Rules listed with enable/disable toggles
- Rules fire in order; visual log shows when each rule triggered

---

## Results & Analytics

### Summary Cards
- Final value ($X, +Y%)
- Best single day
- Worst single day
- Total trades executed (manual + rule-triggered)

### Charts
- Portfolio value over time (line chart, full simulation period)
- Allocation breakdown at start vs end (donut charts)
- Drawdown chart (how far below peak at each point)

### Advanced Analytics
- **Sharpe Ratio** — risk-adjusted return
- **Max Drawdown** — largest peak-to-trough decline
- **Volatility** — annualized standard deviation of returns
- **Beta** — correlation vs S&P 500 during scenario

### Shareable Results Card
- Screenshot-optimized card showing: scenario name, final value, % return, top/worst holdings
- "Share" button generates a PNG (html-to-canvas or similar)
- Designed to look great as a tweet/Instagram story

---

## Snarky Narrator System

### News Chyron (Bottom Ticker)
- Persistent scrolling text during simulation
- Rotates between:
  - Market commentary ("TSLA down 12% because reasons")
  - Roasts of user's portfolio ("Bold of you to go all-in on crypto")
  - Fake financial news headlines appropriate to the scenario
  - Generic finance bro satire

### Pop-up Notifications
Triggered by events:
- Position up/down > 10% in a single period
- A rule fires
- Portfolio hits a new high or low
- A major historical event occurs (e.g. "Lehman Brothers just collapsed, congrats")
- User makes a manual trade

### Tone Guidelines
- Dry, deadpan sarcasm
- Never mean-spirited, always punches at finance culture not the user
- Examples:
  - "Ah yes, leveraged crypto. A classic."
  - "Your portfolio is doing great if you're trying to lose money."
  - "A rule just fired. Your robot overlord is pleased."
  - "You've lost more than a Peloton investor. Respect."

---

## Monetization

### Ad Placements
| Placement | Type | Screen |
|-----------|------|--------|
| Top banner | Static banner | Landing page |
| Above chyron | Small banner | Simulation screen |
| Between result sections | Card/native | Results screen |
| Between rows | Banner | Leaderboard |
| Between scenarios | Interstitial | On scenario transition |

### Principles
- Ads never interrupt active simulation playback
- Interstitials only between sessions (not mid-simulation)
- All ads clearly labeled
- No autoplay video ads
- Ad slots gracefully hidden if no ad loads (no empty white boxes)

---

## Design System

### Theme
- **Mode:** Dark only (v1)
- **Feel:** eTrade meets a fun app — professional layout, playful personality
- **Mobile-first:** All layouts designed for 375px+ first, desktop is enhancement

### Color Palette (approximate)
- Background: `#0a0a0f` (near-black)
- Surface: `#13131a`
- Border: `#1e1e2e`
- Green (gains): `#00d084`
- Red (losses): `#ff4757`
- Accent: `#7c6aff` (purple — money/premium feel)
- Text primary: `#f0f0f5`
- Text secondary: `#8888aa`

### Typography
- Headings: Bold, tight tracking
- Numbers: Monospace font for all financial figures
- Chyron: Smaller, muted, scrolling

### Key Mobile Patterns
- Bottom sheet for instrument detail / rule builder
- Swipeable cards for scenario selection
- Large tap targets on all controls
- Chart interactions: pinch-to-zoom, tap for tooltip

---

## Leaderboard

- Stored in `localStorage` (v1) — personal bests only
- Future: optional crowd-sourced via lightweight API
- Tracks:
  - Scenario name
  - Starting capital
  - Final value
  - % return
  - Instruments used
  - Date simulated
- Sorted by: Best return, Worst return (hall of shame tab)
- Filter by scenario

---

## Data Strategy

### Historical Data
- Pre-baked static JSON files per instrument per scenario
- Stored in `/public/data/` or imported as JS modules
- Daily OHLCV (open, high, low, close, volume) granularity
- Sourced from public domain / Yahoo Finance historical exports

### Future Projections
- Uses historical volatility from selected scenario
- Monte Carlo-style random walk seeded from scenario's statistical properties
- Correlation matrix preserved across instruments
- Clearly marked as "Projected" in all UI elements
- New random seed on each simulation run

---

## Future Considerations (Not v1)

- User accounts + saved simulations
- Real-time data mode
- Multiplayer / challenge a friend
- AI-generated scenario narration (GPT-powered)
- More exotic instruments (CDOs, swaps)
- Paid tier with ad-free experience
- Native mobile app

---

## Resolved Decisions

1. **Charting library → Recharts.** React-native, dark mode friendly, mobile touch support, good animation. Used directly (not via Tremor wrapper) for full design control. See `docs/references/recharts-llms.txt`.

2. **Static data format → Daily OHLCV JSON per instrument per scenario.** Files at `public/data/{scenario-slug}/{TICKER}.json`. Sourced from Yahoo Finance historical exports (adjusted close). Schema defined in `docs/generated/data-schema.md`.

3. **Options pricing → Black-Scholes (European style).** Implemented in `src/lib/blackScholes.ts`. Implied volatility approximated from 30-day historical volatility of underlying. Risk-free rate hardcoded per scenario. American-style options deferred to v2 (TD-001). Full details in `docs/design-docs/options-pricing.md`.

4. **Dispersion trade mechanics → Realized vs benchmark correlation spread.** Benchmark = average pairwise correlation of components over 2yr lookback prior to scenario. Realized = rolling correlation computed each tick during simulation. P&L = notional × (realized − benchmark) × 1.5 × positionSign. Full details in `docs/design-docs/dispersion-trades.md`.

5. **Ad network → Google AdSense.** Broad inventory, straightforward Next.js integration via `next/script`. Real publisher ID (ca-pub-XXXXXXXX) needed before launch (TD-006). Placement principles in Monetization section above.
