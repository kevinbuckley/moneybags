# Data Layer Design

**Modules:** `src/data/`, `public/data/`
**Dependencies:** `src/types/`

---

## Overview

All historical price data is shipped as static JSON files in `public/data/`. The data layer provides typed loaders, scenario definitions, and the instrument master list. No external APIs are called in v1.

---

## File Structure

```
public/data/
├── {scenario-slug}/
│   ├── {TICKER}.json        ← OHLCV data for one instrument in one scenario
│   └── ...
├── instruments.json         ← Master list of all supported instruments
└── scenarios.json           ← Scenario metadata
```

### Scenario Slugs
| Scenario | Slug |
|---|---|
| 2008 Financial Crisis | `2008-crisis` |
| Dot-com Bubble | `dotcom-bubble` |
| Black Monday | `black-monday` |
| COVID Crash + Recovery | `covid-crash` |
| 2020–2021 Bull Run | `2021-bull-run` |
| 2022 Crypto Winter | `2022-crypto-winter` |
| Custom | N/A (uses instrument files from nearest scenario or spliced range) |

---

## Data Schemas

See [docs/generated/data-schema.md](../generated/data-schema.md) for full JSON schemas.

### Instrument Price File (`public/data/{scenario}/{TICKER}.json`)
```json
{
  "ticker": "SPY",
  "name": "SPDR S&P 500 ETF Trust",
  "type": "etf",
  "scenario": "2008-crisis",
  "startDate": "2008-01-02",
  "endDate": "2009-03-31",
  "currency": "USD",
  "series": [
    {
      "date": "2008-01-02",
      "open": 146.21,
      "high": 146.32,
      "low": 143.11,
      "close": 144.93,
      "volume": 123456789
    }
  ]
}
```

### Instruments Master (`public/data/instruments.json`)
```json
[
  {
    "ticker": "SPY",
    "name": "SPDR S&P 500 ETF Trust",
    "type": "etf",
    "availableScenarios": ["2008-crisis", "dotcom-bubble", "covid-crash", "2021-bull-run", "2022-crypto-winter"],
    "description": "Tracks the S&P 500 index",
    "tags": ["index", "large-cap", "us"]
  }
]
```

### Instrument Types
```typescript
type InstrumentType =
  | 'stock'
  | 'etf'
  | 'crypto'
  | 'bond'
  | 'option'        // requires additional option metadata
  | 'leveraged'     // leveraged ETF or margin position
  | 'short'         // short position
  | 'dispersion'    // dispersion trade basket
```

---

## Data Loaders (`src/data/loaders.ts`)

```typescript
// Load price series for a single instrument in a scenario
async function loadPriceSeries(ticker: string, scenario: string): Promise<PriceSeries>

// Load price series for multiple instruments in parallel
async function loadPriceDataMap(tickers: string[], scenario: string): Promise<PriceDataMap>

// Load all available instruments
async function loadInstruments(): Promise<Instrument[]>

// Load all scenario definitions
async function loadScenarios(): Promise<Scenario[]>
```

All loaders:
- Use `fetch('/data/...')`
- Return typed results
- Throw a `DataLoadError` with ticker + scenario info on failure
- Cache results in module-level Map to avoid re-fetching

---

## Instrument Coverage Plan

### Minimum viable dataset per scenario

Each scenario must have at minimum:
- SPY (S&P 500 proxy)
- QQQ (Nasdaq proxy)
- GLD (Gold proxy)
- TLT (Long-term bond proxy)
- Top 5 scenario-relevant stocks
- BTC (where available — 2017+)

### Full target instrument list

**Stocks:** AAPL, MSFT, AMZN, GOOGL, META, TSLA, NVDA, GME, NFLX, JPM, GS, BAC, C, WFC, GE, CSCO, INTC, IBM

**ETFs:** SPY, QQQ, VTI, IWM, GLD, SLV, TLT, AGG, HYG, VXX, SQQQ, TQQQ

**Crypto:** BTC, ETH, DOGE, SOL (where historically available)

**Coverage matrix** — not all instruments exist in all scenarios. Missing combinations show a "Not available in this scenario" message.

---

## Custom Date Range

For custom date ranges, the loader splices data from the appropriate scenario file(s). If the date range spans multiple scenario files (e.g., Jan 2019 – Dec 2021), data is concatenated and de-duplicated by date.

---

## Data Sourcing

Historical OHLCV data sourced from Yahoo Finance historical exports (public domain daily data). Data must be:
- Adjusted for splits and dividends
- In USD
- Daily granularity
- Stored as-is — no server-side transformation

Data sourcing is a **human task** — run the sourcing scripts in `scripts/source-data/` to generate the JSON files. Agents do not source data; they consume it.
