# Product Spec: Results Screen

**Route:** `/results`
**Phase:** 3
**Design refs:** [docs/DESIGN.md](../DESIGN.md), [docs/design-docs/simulation-engine.md](../design-docs/simulation-engine.md)

---

## Layout

Single scrollable page. Sections from top:

1. Hero summary (final value, return)
2. Ad card
3. Portfolio chart (full period)
4. Analytics panel
5. Position breakdown
6. Drawdown chart
7. Share card
8. Action buttons
9. Ad banner

---

## Section 1: Hero Summary

Large, prominent display:
```
$14,230
+$4,230 (+42.3%)

2008 Financial Crisis
Jan 2008 – Mar 2009
```

Color: positive = `text-gain`, negative = `text-loss`
Narrator quote below: "Impressive. In a real crash, you'd have panic-sold at the bottom."

---

## Section 2: Portfolio Chart

Same chart as simulation screen but full read-only view:
- Full simulation period on X-axis
- No playback controls
- All event markers visible
- Touch to explore (scrub timeline)

---

## Section 3: Analytics Panel

4-card grid (2×2 on mobile):

| Card | Value | Tooltip |
|---|---|---|
| Sharpe Ratio | 1.42 | "Risk-adjusted return. Higher = better." |
| Max Drawdown | -31.2% | "Worst peak-to-trough decline during the simulation." |
| Volatility | 24.3% ann. | "How wildly your portfolio swung around." |
| Beta vs S&P | 1.18 | "How closely you tracked the market (1.0 = exact)." |

Also show:
- Best single day: +8.3% (date)
- Worst single day: -9.1% (date)
- Total manual trades: 3
- Rules fired: 7

---

## Section 4: Position Breakdown

List of all instruments held at any point:

| Ticker | Entry | Exit | Return | |
|---|---|---|---|---|
| AAPL | $2,000 | $2,840 | +42.0% | 🟢 |
| BTC | $1,500 | $630 | -58.0% | 🔴 |
| SPY | $5,000 | $5,890 | +17.8% | 🟢 |

Sorted by return (best → worst).

---

## Section 5: Drawdown Chart

Area chart showing portfolio's % decline from its rolling high at each point in time. Colored red. Highlights max drawdown point.

---

## Section 6: Share Card

A specially styled card designed to screenshot beautifully:

```
┌──────────────────────────────┐
│  💰 MoneyBags                 │
│  2008 Financial Crisis       │
│                              │
│  $14,230  +42.3%             │
│  ████████████  (sparkline)   │
│                              │
│  Top pick: AAPL +42%         │
│  Worst pick: BTC -58%        │
│                              │
│  moneybags.app               │
└──────────────────────────────┘
```

"Share Results" button → calls `html2canvas` on the card → offers PNG download + native share sheet on mobile.

---

## Section 7: Action Buttons

- "Try Again (same scenario)" — resets to setup step 3 with same scenario
- "Try a Different Scenario" — resets to setup step 2
- "View Leaderboard" → `/leaderboard`

---

## Leaderboard Submission

On results load, automatically add result to `leaderboardStore` (localStorage):
```typescript
{
  id: uuid,
  scenario: string,
  startingCapital: number,
  finalValue: number,
  returnPct: number,
  instruments: string[],
  date: string   // when simulation was run
}
```
