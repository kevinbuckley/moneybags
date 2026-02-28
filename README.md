# 💰 MoneyBags

### *The financial simulator that lets you make all your worst decisions — but with fake money.*

---

Ever wondered what would happen if you'd bought GameStop in January 2021? Or if you'd leveraged 3x into NASDAQ right before the dot-com bubble popped? What if you'd put everything into crypto in November 2021?

Now you can find out. MoneyBags lets you build a portfolio, set up rules ("sell everything if SPY drops 10%"), and then watch it play out through the greatest financial disasters — and bull runs — in modern history. All in fake money. No therapist required.

---

## What You Can Do

**Pick your poison — choose a historical scenario:**
- 🔴 **2008 Financial Crisis** — watch the world end in slow motion
- 🔴 **Dot-com Bubble (2000–2002)** — tech stocks going to the moon, then the floor
- 🔴 **Black Monday (1987)** — one very bad Monday
- 🟡 **COVID Crash + Recovery** — the world ends, then doesn't
- 🟢 **2020–2021 Bull Run** — number only go up (for a while)
- 🔴 **2022 Crypto Winter** — LUNA goes to actual zero

**Build a real portfolio with real instruments:**
- Stocks: AAPL, TSLA, NVDA, GME, and more
- ETFs: SPY, QQQ, TLT, GLD, and more
- Crypto: BTC, ETH, DOGE, SOL
- Leveraged: TQQQ (3x QQQ), SQQQ (3x inverse QQQ)
- Options (calls, puts, spreads, straddles, iron condors)
- Short positions & dispersion trades

**Set up rules that do your panic-selling for you:**
- "If SPY drops 5% in a day → sell 50% of everything"
- "If my GME position is up 300% → sell it all immediately (I won't)"
- "If cash drops below $1,000 → buy more DOGE" *(we don't recommend this)*

**Let a snarky narrator judge your decisions in real time:**

> *"AAPL down 15%. Bold strategy. Let's see if it pays off."*
> *"Your GME position is aging like milk."*
> *"Reminder: Warren Buffett was not born knowing this stuff either."*

**Review your results:**
- Sharpe ratio, max drawdown, annualized volatility, beta
- Best and worst single days
- Full portfolio chart with annotated historical events
- Share your results card to show off (or commiserate)
- Leaderboard — because suffering is better with rankings

---

## How It Works

MoneyBags runs a fully local, deterministic simulation engine on real historical OHLCV data fetched from Yahoo Finance. Every tick is one trading day. Your rules fire automatically. Options are priced with Black-Scholes. The narrator generates snarky commentary based on what's happening.

The future (if you run out of historical data) is projected with a calibrated Monte Carlo random walk. Same starting conditions → same projection. We're not just making stuff up. We're *algorithmically* making stuff up.

---

## Tech Stack

| Thing | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | We're not animals |
| State | Zustand v5 | Tiny and fast |
| Charts | Recharts | Works, doesn't complain |
| Options pricing | Black-Scholes (European) | The classic |
| Projections | Monte Carlo random walk | Vibes-based finance |
| Styling | Tailwind v4 | CSS is a feeling |
| Data | Yahoo Finance → static JSON | Free and offline-capable |
| Deployment | Vercel | Obviously |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Type check + lint
pnpm test

# Re-fetch historical data (requires internet)
node scripts/source-data.mjs
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── types/          # TypeScript types (no dependencies)
├── lib/            # Pure math: Black-Scholes, Monte Carlo, correlation, narrator
├── data/           # Static scenario & instrument definitions, data loaders
├── engine/         # Simulation engine: portfolio, rules, simulator (no React/Zustand)
├── store/          # Zustand stores
├── hooks/          # React hooks
├── components/     # UI components
└── app/            # Next.js App Router pages

public/data/        # 77 historical OHLCV JSON files (6 scenarios × instruments)
scripts/            # source-data.mjs — re-fetch Yahoo Finance data
docs/               # Harness engineering docs, exec plans, design docs
```

Layer dependency order is mechanically enforced by ESLint:
`types → lib → data → engine → store → hooks → components → app`

---

## Scenarios & Instruments

| Ticker | 2008 | Dot-com | Black Mon | COVID | 2021 | 2022 Crypto |
|--------|------|---------|-----------|-------|------|-------------|
| SPY    | ✓    | ✓       |           | ✓     | ✓    | ✓           |
| QQQ    | ✓    | ✓       |           | ✓     | ✓    | ✓           |
| GLD    | ✓    |         |           | ✓     | ✓    | ✓           |
| TLT    | ✓    |         |           | ✓     | ✓    | ✓           |
| AAPL   | ✓    | ✓       |           | ✓     | ✓    | ✓           |
| MSFT   | ✓    | ✓       |           | ✓     | ✓    | ✓           |
| AMZN   | ✓    | ✓       |           | ✓     | ✓    | ✓           |
| TSLA   |      |         |           | ✓     | ✓    | ✓           |
| NVDA   |      |         |           | ✓     | ✓    | ✓           |
| GME    |      |         |           |       | ✓    |             |
| BTC    |      |         |           | ✓     | ✓    | ✓           |
| ETH    |      |         |           | ✓     | ✓    | ✓           |
| DOGE   |      |         |           |       | ✓    | ✓           |
| SOL    |      |         |           |       | ✓    | ✓           |
| TQQQ   |      |         |           | ✓     | ✓    | ✓           |
| IBM    |      |         | ✓         |       |      |             |
| +more  |      |         |           |       |      |             |

---

## Disclaimer

Past performance does not indicate future results. This is fake money. The narrator is rude on purpose. MoneyBags is a finance simulator for entertainment and education — not financial advice. Please do not make real investment decisions based on what happens to your fake GME position.

*Warren Buffett did not use this app.*

---

<div align="center">
  <sub>Built with Next.js · Deployed on Vercel · Data from Yahoo Finance</sub>
</div>
