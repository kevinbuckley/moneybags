# Product Spec: Leaderboard

**Route:** `/leaderboard`
**Phase:** 3

---

## Purpose

Show users their personal best (and worst) simulation results. Bragging rights and shame, in equal measure.

---

## Data Source

`localStorage` via `leaderboardStore`. Populated automatically when results screen loads.

Maximum 50 entries stored (oldest evicted when full).

---

## Layout

### Tabs
- **Best Returns** (default)
- **Hall of Shame** (worst returns)

### Filters
- "All Scenarios" dropdown → filter by scenario

### Entry Card
```
#1  2008 Financial Crisis
    $10,000 → $14,230  +42.3%
    AAPL, BTC, SPY
    Simulated Feb 27, 2026
    [Replay →]
```

Fields:
- Rank number
- Scenario name
- Starting → final value + % return (color-coded)
- Instruments used (comma-separated tickers, truncated if >5)
- Date simulated
- "Replay" button → loads that scenario + portfolio config back into setup

### Empty State
If no simulations yet:
"No simulations yet. What are you waiting for? Your fake fortune won't lose itself."
CTA → "Start Simulating"

---

## Replay

Tapping "Replay" on a leaderboard entry:
- Loads the scenario + starting capital + instruments into `portfolioStore`
- Rules are NOT restored (simplification — rules aren't persisted)
- Navigates to `/setup` at step 3 (portfolio review) so user can adjust before relaunching

---

## Ad Placement
Small banner ad between entries 3 and 4.
