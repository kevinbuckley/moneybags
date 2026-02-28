# Generated: Data Schema Reference

> This file documents the JSON schemas for all static data files. Update when schemas change.

---

## `public/data/{scenario}/{TICKER}.json`

```json
{
  "ticker": "string — uppercase, e.g. 'SPY'",
  "name": "string — full instrument name",
  "type": "string — one of: stock | etf | crypto | bond",
  "scenario": "string — scenario slug",
  "startDate": "string — YYYY-MM-DD",
  "endDate": "string — YYYY-MM-DD",
  "currency": "string — always 'USD' in v1",
  "series": [
    {
      "date": "string — YYYY-MM-DD",
      "open": "number — opening price",
      "high": "number — daily high",
      "low": "number — daily low",
      "close": "number — closing price (adjusted)",
      "volume": "number — shares traded"
    }
  ]
}
```

**Constraints:**
- `series` must be sorted ascending by `date`
- No gaps allowed (missing trading days should use previous close for open/high/low/close with volume=0)
- All prices adjusted for splits and dividends
- `close` is the canonical price used for portfolio valuation

---

## `public/data/instruments.json`

```json
[
  {
    "ticker": "string — uppercase",
    "name": "string — full name",
    "type": "string — InstrumentType",
    "availableScenarios": ["string — scenario slugs where data exists"],
    "description": "string — one-line description",
    "tags": ["string — e.g. 'index', 'large-cap', 'us', 'crypto'"]
  }
]
```

---

## `public/data/scenarios.json`

```json
[
  {
    "slug": "string — URL-safe identifier",
    "name": "string — display name",
    "startDate": "string — YYYY-MM-DD",
    "endDate": "string — YYYY-MM-DD",
    "description": "string — one-line description",
    "snarkDescription": "string — snarky one-liner for UI cards",
    "color": "string — 'red' | 'green' | 'yellow'",
    "riskFreeRate": "number — annualized decimal, e.g. 0.02 for 2%",
    "events": [
      {
        "date": "string — YYYY-MM-DD",
        "label": "string — short event name",
        "description": "string — one-sentence description"
      }
    ]
  }
]
```

---

## TypeScript Equivalents

All schemas map directly to types in `src/types/`. See:
- `src/types/instrument.ts` → `PricePoint`, `PriceSeries`
- `src/types/scenario.ts` → `Scenario`, `ScenarioEvent`
